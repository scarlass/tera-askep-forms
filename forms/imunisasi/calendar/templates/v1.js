/** @type {Map<string, Window>} */
const opened_forms = new Map();

window.__imunisasi ||= {};

/**
 * @param {string} ns
 */
function open_window_form(ns) {
    const values = window.__imunisasi[ns].values || {};

    const params = new URLSearchParams();
    params.set('mod', 'satusehat_form');
    params.set('cmd', 'imunisasi_detail_form');
    params.set('namespace', ns);
    params.set('pid', "{PID}");
    params.set('regpid', "{REGPID}");
    params.set('filled', +values.filled);

    const win = window.open(
        `{BASEURL}?${params.toString()}`,
        "_blank",
        'width=800,height=820,resizable=yes');

    console.debug("initial values -", { ...values });


    let win_listener
    win.addEventListener('load', function () {
        if (!win) return;
        win.process_listener = win_listener;
        opened_forms.set(ns, win);
    });
    win.addEventListener('close', function () {
        opened_forms.delete(ns, win);
        window.removeEventListener('message', win_listener);
    });
    window.addEventListener('message', (win_listener = function (e) {
        const { action, namespace, values: answer } = e.data;
        if (namespace !== ns) return;

        if (action === 'save') {
            values.filled = true;
            for (const key in answer) {
                window.__imunisasi[namespace].values[key] = answer[key];
            }

            console.debug('%s saved', namespace, { ...values });
        }
        else if (action === 'delete')
            reset_namespace_values(namespace);
        else if (action === 'cancel')
            win.resizeTo(win.outerWidth, e.data.height);

        win.close();
    }));
}

function reset_namespace_values(ns) {
    const values = window.__imunisasi[ns].values;
    for (const k in values) {
        const val = values[k];
        switch (typeof val) {
            case 'boolean':
                values[k] = false;
                break;
            case 'number':
                values[k] = 0;
            default:
                values[k] = '';
                break;
        }
    }
}

window.addEventListener('beforeunload', function (e) {
    if (!opened_forms.size) return;
    for (const winform of opened_forms)
        winform.close();
});

$(document).ready(function () {
    const SAVE_EVENT = "imunisasi:save";
    const DEL_EVENT = "imunisasi:del";

    const $win = $(window);
    const $form = $("#imunisasi-schedule-form");
    const $dialog = $("#modal-form");

    $("td[data-namespace]").each(function (n, el) {
        const $ctn = $(el); // container
        const $btn = $ctn.find("button.btn.trigger"); // pop-up opener
        const $filled = $ctn.find(`input[data-namespace-field="filled"]`); // filled marker

        /** @type {string} */
        const ns = el.dataset.namespace;

        const values = {};

        $ctn.find('input[data-namespace-field]').each(function (n, /** @type {HTMLInputElement} */ el) {
            const $inp = $(el);
            const { namespaceField: field, type: subtype } = el.dataset;

            const hasShadowElement = typeof el.dataset.shadowed !== 'undefined';
            const sync_shadow = (type, init_value) => {
                // console.log($inp[0], `hasShadowElement ? ${hasShadowElement}`);
                if (!hasShadowElement) return;

                const $shadowEl = $ctn.find('#' + el.id + '\\:shadow');
                switch (type) {
                    case 'bool':
                    case 'boolean':
                        $shadowEl.prop('checked', init_value);
                        $inp.on('change', () => {
                            $shadowEl.prop('checked', values[field]);
                        });
                        break;
                    default:
                        $shadowEl.val(init_value);
                        $inp.on('change', () => {
                            $shadowEl.val(values[field]);
                        });
                        break;
                }
            };

            switch (el.type) {
                case 'checkbox':
                    Object.defineProperty(values, field, {
                        enumerable: true,
                        get: () => el.checked,
                        set: v => {
                            console.log('%s - %s', ns, field, v);
                            el.checked = Boolean(v);
                            el.dispatchEvent(new Event('change'));
                        },
                    });

                    sync_shadow('bool', el.checked);
                    break;
                default:
                    if (subtype === 'boolean') {
                        if (field === "filled")
                            console.log('>> %s', field, el.id);
                        Object.defineProperty(values, field, {
                            enumerable: true,
                            get: () => el.value === 't',
                            set: v => {
                                el.value = v ? 't' : 'f';
                                el.dispatchEvent(new Event("change"));
                            },
                        });
                    } else {
                        Object.defineProperty(values, field, {
                            enumerable: true,
                            get: () => el.value,
                            set: v => {
                                el.value = v;
                                el.dispatchEvent(new Event("change"));
                            },
                        });
                    }

                    sync_shadow(subtype || 'default', values[field]);
            }
        });

        $btn.data("filled", values.filled);
        $filled.on("change", function (e) {
            console.log("%s - filled change = %s", this.dataset.namespaceField, values.filled);
            $btn[0].setAttribute("data-filled", String(values.filled));
            // $btn.data("filled", values.filled);
        });
        // $btn[0].dataset.filled = String($filled[0].checked);
        // $filled.on("change", function (e) {
        //     console.log(`namespace=${ns} filled=${$filled[0].checked}`);
        //     $btn[0].dataset.filled = String($filled[0].checked)
        // });

        window.__imunisasi[ns] = {
            ns,
            values: Object.freeze(values)
        };
    });
});
