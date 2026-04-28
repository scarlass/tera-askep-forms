
/** @type {Map<string, Window>} */
const opened_forms = new Map();

window.__imunisasi ||= {};
const fillable = window.__imunisasi.fillable || [
    "filled",
    "praktik-tanggal",
    "praktik-waktu",
    "deskripsi",
    "vaksin",
    "vaksin-exp",
    "vaksin-dosis",
    "vaksin-dosis-unit",
    "perawat",
    "program",
    "kipi-check",
    "kipi-kode",
];

function namespace_open(namespace, age) {
    const root = window.__imunisasi.root;
    const ns = `${namespace}[${age}]`;

    window.__imunisasi[ns] ||= {};
    let values = window.__imunisasi[ns].values = form_inputs_values(
        root,
        namespace, age
    );

    const params = new URLSearchParams();
    params.set('mod', 'satusehat_form');
    params.set('cmd', 'imunisasi_detail_form');
    params.set('namespace', ns);
    params.set('pid', "{PID}");
    params.set('regpid', "{REGPID}");
    params.set('filled', values.filled === "on" ? 1 : 0);

    const win = window.open(
        `{BASEURL}?${params.toString()}`,
        "_blank",
        'width=800,height=820,resizable=yes');

    let message_listener
    win.addEventListener('load', function () {
        if (!win) return;
        win.process_listener = message_listener;
        opened_forms.set(ns, win);
    });
    win.addEventListener('close', function () {
        opened_forms.delete(ns, win);
        window.removeEventListener('message', message_listener);
    });
    window.addEventListener('message', (message_listener = function message_listener(e) {
        const { action, namespace: _ns, values: answer } = e.data;
        if (_ns !== ns) return;

        if (action === 'save') {
            answer.filled = "on";
            form_inputs_render(root, namespace, age, answer);

            console.debug('%s saved', _ns, { ...answer });
        }
        else if (action === 'delete')
            form_inputs_remove(root, namespace, age);
        // reset_namespace_values(_ns);
        else if (action === 'cancel')
            win.resizeTo(win.outerWidth, e.data.height);

        win.close();
    }));
}

function fieldname(ns, field) { return `${ns}[${field}]` }

function form_inputs_values(root, namespace, age) {
    const ns = `${namespace}[${age}]`;
    const fs = root.elements[`${namespace}[${age}]`];

    const values = {
        namespace: ns,
        age: age,
        type: fs.dataset.type
    };

    for (const key of fillable) {
        values[key] = fs.elements[fieldname(ns, key)]?.value ?? "";
    }

    return values;
}
function form_inputs_remove(root, namespace, age) {
    const ns = `${namespace}[${age}]`;

    /** @type {HTMLFieldSetElement & {button: HTMLButtonElement}} */
    const fs = root.elements[`${namespace}[${age}]`];
    if (!fs.button)
        fs.button = $(fs.parentNode).find("button.trigger").get(0);

    $(fs).empty();
    fs.button.setAttribute("data-filled", "false");
    delete window.__imunisasi[ns];
}
function form_inputs_render(root, namespace, age, values) {
    const ns = `${namespace}[${age}]`;

    // fieldset
    /** @type {HTMLFieldSetElement & {button: HTMLButtonElement}} */
    const fs = root.elements[`${namespace}[${age}]`];
    if (!fs.button)
        fs.button = $(fs.parentNode).find("button.trigger").get(0);

    $(fs).html([
        `<input myid="check_cara" type="hidden" name="${ns}[namespace]" value="${namespace}" />`,
        `<input myid="check_cara" type="hidden" name="${ns}[age]" value="${age}" />`,
        `<input myid="check_cara" type="hidden" name="${ns}[type]" value="${fs.dataset.type}" />`,
        ...fillable.map(name =>
            `<input myid="check_cara" type="hidden" data-field="${name}" name="${ns}[${name}]" />`
        ),
    ].join("\n"));

    for (const key of fillable) {
        if (!values[key]) continue;
        fs.elements[fieldname(ns, key)].value = values[key];
        fs.elements[fieldname(ns, key)].dispatchEvent(new Event("change"));
    }

    fs.button.setAttribute("data-filled", "true");
}

$(function () {
    const root = document.getElementById('imunisasi-schedule-form');
    window.__imunisasi.root = root;

    setTimeout(() => {
        const fillable_def = {};
        $(root).find("fieldset[data-namespace]").each(function (i, elm) {
            const { namespace, age } = elm.dataset;

            for (const input of elm.elements) {
                if (!input.dataset.field) continue;
                fillable_def[input.dataset.field] = 1;
            }

            if (elm.elements[`${namespace}[${age}][filled]`].value) {
                const values = form_inputs_values(root, namespace);

                $(elm).empty();
                form_inputs_render(root, namespace, age, values);
            } else {
                form_inputs_remove(root, namespace, age);
            }
        });

        window.__imunisasi.fillable = Object.keys(fillable_def);
    }, 400);
});
