/** @type {Record<string, any>} */
// const icd = JSON.parse(``);
const history_url = `{HISTORY_URL}`;

/** @type {Record<string, {value: string; label: string}[]>} */
const search_options = JSON.parse(`{OPTIONS}`);

const ns = "{FIELD_NAMESPACE}";
const ce = document.createElement;
/** @type {typeof document.getElementById} */
const eid = document.getElementById.bind(document);
/** @type {typeof document.querySelector} */
const qs = document.querySelector.bind(document);

const values = { ...(window.opener?.__imunisasi[ns].values ?? {}) };

/** @type {HTMLFormElement} */
const form = eid("imunisasi-detail-form");
const kipi_check = eid("kipi-check");
const kipi_kode = eid("kipi-kode");

kipi_check.addEventListener("change", function () {
    kipi_kode.disabled = !this.checked;
});
setInterval(() => {
    kipi_kode.disabled = !kipi_check.checked;
}, 500);

// $(form).on("change", _ => )
$(form)
    .find("select.combobox")
    .each(function (n, el) {
        const options_field = el.dataset.options || el.name;
        const options = search_options[options_field] || [];

        $(el)
            .removeClass("form-control")
            .select2({
                data: [
                    { id: "" },
                    ...options.map((e) => ({ id: e.value, text: e.label })),
                ],
                placeholder: "pilih / cari...",
                allowClear: true,
                width: "100%",
                theme: "bootstrap",
                containerCssClass: ":all:",
            });
    });

$("#diagnosa").each(function (n, el) {
    const update_view = (e) => {
        /** @type {HTMLTextAreaElement} */
        const el = e.target;
        let items = el.value
            .split("||")
            .map((e) => `<kbd class="">${e}</kbd>`.repeat(1));

        // mirror
        $("#" + el.id + "-view").html(items.join(" "));
    };

    update_view({ target: el });
    $(el).on("change", update_view);
});

if (values.filled) {
    const selector = ["input", "textarea", "select"]
        .map((s) => `${s}[name]:not(form form ${s})`)
        .join(", ");

    $(form)
        .find(selector)
        .each(function (n, el) {
            const field = el.name;
            const value = values[field];

            if (el.type === "checkbox") el.checked = !!value;
            else el.value = value;

            el.dispatchEvent(new Event("change", { bubbles: true }));
        });
}

/** @type {(<T={}>(action: string, data?: T) => ({action: string; namespace: string} & T))} */
const createMessage = (action, data = {}) => ({
    action,
    namespace: ns,
    ...data,
});

$("#vaksin").on("change", function () {
    const option = search_options?.vaksin?.find(e => e.value === this.value);
    console.log(option);
    $("#vaksin-exp").val(option.expire);
    $("#vaksin-exp").trigger("change");
});

$("#form-save").on("click", function () {
    const values = {};
    for (const inp of form.elements) {
        if (inp instanceof HTMLInputElement) {
            if (inp.type === "checkbox") {
                values[inp.name] = inp.checked;
            } else {
                values[inp.name] = inp.value;
            }
        } else if (
            inp instanceof HTMLTextAreaElement ||
            inp instanceof HTMLSelectElement
        ) {
            values[inp.name] = inp.value;
        }
    }

    window.opener?.postMessage(createMessage("save", { values }));
});
$("#form-cancel").on("click", function () {
    window.opener?.postMessage(createMessage("close", { values }));
});
$("#form-delete")
    .prop("disabled", !values.filled)
    .on("click", function () {
        window.opener?.postMessage(createMessage("delete"));
    });


// console.log($("#imunisasi-history").datatable);
// console.log("jq functions =>", $.fn);

/**
 * @type {Record<string, Record<string, {value: string; label: string}>>}
 */
const search_options_map = Object.fromEntries(Object.keys(search_options).map(e => {
    const records = search_options[e].map(v => [v.value, v]);
    return [e, Object.fromEntries(records)];
}))

console.log(search_options_map);
function get_immunization_history() {
    const table = eid("imunisasi-history");
    const url = new URL(history_url);
    // url.searchParams.set("page", page);
    // url.searchParams.set("size", size);

    const find = (value, arr) => {
        return arr[value]?.label ?? "";
        // return arr.find(e => e.value === value)?.label ?? "";
    }

    $(table).find("tbody").html(`<tr><td>Mengambil Data...</td></tr>`);
    fetch(url)
        .then(res => res.json())
        .then(res => {
            const { data = [] } = res;
            console.log(search_options);

            let no = 0;
            let view = [];
            for (let i = 0; i < data.length; i++) {
                const rec = data[i];

                const namespaces = [];
                for (const key in rec) {
                    if (key.endsWith("_filled")) {
                        namespaces.push(key.replace("_filled", ""));
                    }
                }

                for (const ns of namespaces) {
                    const deskripsi = rec[ns + "_deskripsi"] ?? "";
                    const vaksin = find(rec[ns + "_vaksin"], search_options_map.vaksin);
                    // const vaksin = rec[ns + "_vaksin"];
                    const vaksinDosis = rec[ns + "_vaksin-dosis"] ?? "";
                    const vaksinDosisUnit = find(rec[ns + "_vaksin-dosis-unit"], search_options_map.dosis);
                    const praktikWaktu = rec[ns + "_praktik-waktu"] ?? "";
                    const praktikTanggal = rec[ns + "_praktik-tanggal"] ?? "";
                    const program = find(rec[ns + "_program"], search_options_map.program);
                    const kipiCheck = rec[ns + "_kipi-check"] === "t";
                    const kipiKode = !kipiCheck ? "-" : find(rec[ns + "_kipi-kode"], search_options_map.kipi);

                    view.push(`
                        <tr>
                            <td>${no + 1}</td>
                            <td>${praktikTanggal} ${praktikWaktu}</td>
                            <td class="tw:max-w-[300px]">${deskripsi}</td>
                            <td>${vaksin}</td>
                            <td>${vaksinDosis}</td>
                            <td>${vaksinDosisUnit}</td>
                            <td>${program}</td>
                            <td>${kipiKode}</td>
                        </tr>
                    `);
                    no++;
                }
            }

            $(table).find("tbody").html(view.join("\n"));
        })
        .catch(err => console.error("error on fetch", err));
}


get_immunization_history();


/** @type {HTMLInputElement} */
const praktikDatePicker = eid("tanggal");
/** @type {HTMLInputElement} */
const praktikTimePicker = eid("waktu");

const d = new Date();
if (!praktikDatePicker.valueAsDate)
    praktikDatePicker.valueAsDate = d;
if (!praktikTimePicker.valueAsDate) {
    d.setHours(d.getHours() + 7);
    praktikTimePicker.valueAsDate = d;
}
