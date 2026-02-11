/**
 * @typedef FetusElements
 * @property {HTMLElement} root
 * @property {HTMLButtonElement} closer
 * @property {HTMLInputElement} ref
 * @property {HTMLInputElement} pulse
 * @property {HTMLSelectElement} pap_head
 * @property {HTMLInputElement} pap_head_disp
 * @property {HTMLSelectElement} position
 * @property {HTMLInputElement} position_disp
 */

const AntenatalCare = window.AntenatalCare = (() => {
    class FetusForm extends EventTarget {
        #index = 0;
        #base = randomString();
        #value = {
        };

        /** @type {FetusElements} */
        elements = {};

        /**
         *
         * @param {number} index
         * @param {string} base
         * @param {HTMLElement} container
         */
        constructor(index, base) {
            super();
            this.#index = index ?? 0;
            this.#base = base;
        }

        set index(n) {
            this.#index = n;
            // console.log("rerun render", this);
            this.render();
        }
        get index() {
            return this.#index;
        }

        set value(v) {
            // this.#value = v;
            if (!isDefined(v)) {

            } else {
                for (const k in v) {
                    this.elements[k].value = v[k];
                    this.elements[k].dispatchEvent(new Event("change"));
                }
            }
        }
        get value() {
            if (!this.elements.root) return {};
            const { root, closer, ...inputs } = this.elements;
            return Object.fromEntries(Object.keys(inputs).map(k => [k, inputs[k].value]));
        }

        remove() {
            this.elements.root?.remove();
            this.dispatchEvent(new Event("remove"));
        }

        /**
         *
         * @param {HTMLElement} parent
         */
        render(parent) {
            const $view = this.#template();

            const ids = this.#ids;

            /** @type {FetusElements} */
            const elements = {
                root: $view.get(0),
                closer: $view.find("button.subfield-action").get(0),
                // ref: $view.find("#" + ids.ref).get(0),
                // pulse: $view.find("#" + ids.pulse).get(0),
                // position: $view.find("#" + ids.position).get(0),
                // position_disp: $view.find(`#${ids.position}_disp`).get(0),
                // pap_head: $view.find("#" + ids.pap_head).get(0),
                // pap_head_disp: $view.find(`#${ids.pap_head}_disp`).get(0),
            };

            $(elements.root).find("input,select").each((_, elm) => {
                const key = elm.id.replace(`${this.#base}-`, '');
                elements[key] = elm;
            })

            this.#functionalities(elements);

            if (this.elements.root) {
                const { root, closer, ...inputs } = this.elements;
                for (const name in inputs) {
                    const { value } = inputs[name];
                    elements[name].value = value;
                    elements[name].dispatchEvent(new Event("change"));
                }
                this.elements.root.replaceWith(elements.root);
            } else {
                $view.find("select,input").each((_, elm) => {
                    const { name, value } = elm;
                    this.#value[name] = value;
                });
                parent.append(elements.root);
                this.dispatchEvent(new Event("change"));
            }

            this.elements = elements;
        }

        get #ids() {
            return {
                ref: `${this.#base}-ref`,
                pulse: `${this.#base}-pulse`,
                position: `${this.#base}-position`,
                pap_head: `${this.#base}-pap_head`,
            }
        }

        /**
         *
         * @param {FetusElements} elements
         */
        #functionalities(elements) {
            initAttrDataDisplay(elements.pap_head, elements.root);
            initAttrDataDisplay(elements.position, elements.root);

            const lst = (e) => {
                const { name, value } = e.target;
                this.#value[name] = value;
                this.dispatchEvent(new Event("change"));
            }

            $(elements.root).find("select,input").on("change", lst);
            $(elements.closer).on("click", () => this.remove());
        }

        #template() {
            const ids = {
                ref: `${this.#base}-ref`,
                pulse: `${this.#base}-pulse`,
                pap_head: `${this.#base}-pap_head`,
                position: `${this.#base}-position`,
            };

            return $(`<div id="${this.#base}-form" class="form-subfields">
                <input id="${ids.ref}" name="fetus_values[${this.#index}][ref]" myid="check_cara" type="hidden" value="${this.#base}" />
                <div class="subfield-title">
                    <label>Data Klinis Janin ${this.#index + 1}</label>
                    <button type="button" class="subfield-action">
                        <i class="glyphicon glyphicon-minus-sign"></i>
                    </button>
                </div>

                <div class="form-field">
                    <label class="field-title" for="${ids.pulse}">
                        Denyut Jantung Janin
                        <span class="field-desc">Observation</span>
                    </label>

                    <div class="field-input">
                        <input
                            id="${ids.pulse}"
                            name="fetus_values[${this.#index}][pulse]"
                            myid="check_cara"
                            type="number"
                            inputmode="numeric"
                            min="0"
                            required
                        />
                    </div>
                </div>
                <div class="form-field">
                    <label class="field-title" for="${ids.pap_head}">
                        Kepala Terhadap PAP
                        <span class="field-desc">Observation</span>
                    </label>

                    <input
                        id="${ids.pap_head}_disp"
                        name="fetus_values[${this.#index}][pap_head_disp]"
                        myid="check_cara"
                        type="hidden"
                    />
                    <div class="field-input">
                        <select
                            id="${ids.pap_head}"
                            name="fetus_values[${this.#index}][pap_head]"
                            myid="check_cara"
                            data-display="${ids.pap_head}_disp"
                            required
                        >
                            <option value="249112006" data-display="Head engaged">
                                Masuk Panggul
                            </option>
                            <option value="62098001" data-display="Head not engaged">
                                Belum masuk panggul
                            </option>
                        </select>
                    </div>
                </div>
                <div class="form-field">
                    <label class="field-title" for="${ids.position}">
                        Presentasi/Posisi Janin
                        <span class="field-desc">Observation</span>
                    </label>

                    <input
                        id="${ids.position}_disp"
                        name="fetus_values[${this.#index}][position_disp]"
                        myid="check_cara"
                        type="hidden"
                    />
                    <div class="field-input">
                        <select
                            id="${ids.position}"
                            name="fetus_values[${this.#index}][position]"
                            myid="check_cara"
                            data-display="${ids.position}_disp"
                            required
                        >
                            <option value="1209182005" data-display="Cephalic fetal presentation">
                                Presentasi Kepala
                            </option>
                            <option value="6096002" data-display="Breech presentation">
                                Presentasi Bokong
                            </option>
                            <option value="288203005" data-display="Transverse/oblique lie">
                                Letak Lintang / Oblique
                            </option>
                        </select>
                    </div>
                </div>
            </div>`);
        }
    }

    const jmarshall = (o, space = 0) => space ? JSON.stringify(o, null, " ".repeat(space)) : JSON.stringify(o);
    const junmarshall = (s) => JSON.parse(s);

    function randomString(len = 5) {
        if (!randomString.chars) {
            randomString.chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
            randomString.chars += randomString.chars.toLowerCase();
            randomString.chars += '0123456789';
        }

        const { chars } = randomString;

        let r = '';
        for (let i = 0; i < len; i++) {
            const n = Math.floor(Math.random() * (i === 0 ? 52 : chars.length));
            r += chars[n];
        }
        return r;
    }

    /** @type {(tmpl: string, name: string) => boolean} */
    const isUnresolved = (tmpl, name) => {
        // cek ngecut bagian depan dan belakang (curly braces)
        // e.g: {MYJSON} => MYJSON
        const s = tmpl.slice(1, -1);
        return s === name;
    };

    /** @type {<T>(o: T) => o is Exclude<T, undefined | null | void>} */
    const isDefined = o => {
        return (
            typeof o !== 'undefined' ||
            ({}).toString.call(o) !== '[object Null]'
        );
    }
    const isPrimitive = o => {
        return (
            typeof o === 'string' ||
            o instanceof String ||
            typeof o === 'number' ||
            o instanceof Number ||
            typeof o === 'boolean' ||
            o instanceof Boolean ||
            typeof o === 'bigint' ||
            o instanceof BigInt
        );
    };

    /** @type {<T>(tmpl: string, name: string, defal?: T) => T} */
    const resolve = (tmpl, name, defal = {}) => {
        // console.log("Template stored", name, tmpl);
        return isUnresolved(tmpl, name) ? defal : JSON.parse(tmpl);
    };

    // const nestedObject = {
    //     quisioner: {
    //         q1: {
    //             s1: "on",
    //             s2: "off"
    //         },
    //         q2: {
    //             s1: "on",
    //             s3: "off"
    //         }
    //     }
    // }

    // const targetObject = {
    //     "quisioner[q1][s1]": "on",
    //     "quisioner[q1][s2]": "off",
    //     "quisioner[q2][s1]": "on",
    //     "quisioner[q2][s3]": "off",
    // }

    function flattenToInlineKeys(obj, parentKey = "", out = {}) {
        for (const [key, value] of Object.entries(obj)) {
            const nextKey = parentKey
                ? `${parentKey}[${key}]`
                : key

            if (isDefined(value) && typeof value === "object" && !Array.isArray(value)) {
                flattenToInlineKeys(value, nextKey, out)
            } else if (isDefined(value) && Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {

                    let ivalue = value[i];
                    if (isDefined(ivalue) && typeof ivalue === "object" && !Array.isArray(ivalue)) {
                        const indexKey = `${nextKey}[${i}]`;
                        flattenToInlineKeys(value, indexKey, out);
                    } else {
                        const indexKey = `${nextKey}[]`;
                        out[indexKey] ||= [];
                        out[indexKey][i] = ivalue;
                    }
                }
            } else {
                out[nextKey] = value
            }
        }
        return out
    }

    const PREFILL = resolve(`{ANC_PREFILL}`, "ANC_PREFILL");
    const PREFILL_FETUS = resolve(`{ANC_PREFILL_FETUS}`, "ANC_PREFILL_FETUS", []);

    const FILLED = resolve(`{MYJSON}`, "MYJSON");
    console.log({ PREFILL, FILLED });

    /**
     *
     * @param {HTMLFormElement} root
     */
    function initInputTypeNumber(root) {
        $(root).find("input[inputmode=numeric]").keypress(function (je) {
            /** @type {KeyboardEvent} */
            const e = je.originalEvent;
            const el = e.target;
            if (!/[.,0-9]/.test(e.key)) {
                e.preventDefault();
                return;
            } else {
                if (e.key == "." && el.value.includes("."))
                    e.preventDefault();

                if (e.key === ',' && el.value.includes(","))
                    e.preventDefault();
            }
        });
    }

    /**
     *
     * @param {HTMLSelectElement} elm
     * @param {HTMLElement|Document} [root]
     */
    function initAttrDataDisplay(elm, root = document) {
        if (!elm.dataset.display) return;

        const $elm = $(elm);
        const targetId = elm.dataset.display || elm.id + '_disp';
        const target = $(root).find("#" + targetId).get(0);

        if (!target)
            throw TypeError(`target is undefined ${elm.id}[data-display="${targetId}"]`);

        const fn = () => {
            const opt = elm.selectedOptions.item(0);
            if (!opt) return;

            target.value = opt.dataset.display
            target.dispatchEvent(new Event("change"));
        }

        $elm.on("change", fn);
        fn();
    }

    /**
     *
     * @param  {HTMLInputElement} target
     */
    function initAttrDataMedian(target) {
        // if (target.dataset.medianStart && target.dataset.medianEnd) {
        //     const { medianStart, medianEnd } = target.dataset;
        // } else {
        const $inputs = $(`input[data-range-median=${target.id}]`);
        const fn = () => {
            /** @type {HTMLInputElement[]} */
            const arr = $inputs.toArray();

            const value = arr.map(e => {
                let v = Number(e.value || 0);
                return Number.isNaN(v) ? 0 : v;
            }).reduce((a, b) => a + b) / arr.length;

            target.value = String(value);
        };

        $inputs.on("change", fn);
        fn();
        // }
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initEocVisiteDateTime(root) {
        const result = root.elements.eoc_visit_at;
        const dti = root.elements.eoc_visit_date;
        const tmi = root.elements.eoc_visit_time;

        let dt = new Date()
        if (!result.value) {
            dt.setHours(dt.getHours() + 7);
            dt.setSeconds(0, 0);
        } else {
            const [
                y = dt.getFullYear(),
                mo = dt.getMonth(),
                d = dt.getDate(),
            ] = result.value.split(" ")[0].split("-").map(e => Number(e));
            const [
                h = dt.getHours() + 7,
                mi = dt.getMinutes()
            ] = result.value.split(" ")[0].split(":").map(e => Number(e));

            dt = new Date(y, mo, d, h, mi, 0, 0);
        }

        dti.valueAsDate = dt;
        tmi.valueAsDate = dt;

        // console.log({
        //     dt,
        //     result,
        //     dti,
        //     tmi
        // })
        result.addEventListener("input", () => console.log(result.name, result.value));
        dti.addEventListener("change", function () {
            if (!dti.value) return;
            console.log([dti.value, tmi.value]);

            result.value = [dti.value, tmi.value].filter(e => !!e).join(" ");
        });
        tmi.addEventListener("input", function () {
            if (!tmi.value) return;
            console.log([dti.value, tmi.value]);

            result.value = [dti.value, tmi.value].filter(e => !!e).join(" ");
            $(result).trigger("change");
        });
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initEocTrimester(root) {
        const trimester = root.elements.eoc_trimester;
        const [from, to, median] = [
            root.elements.gst_age_from,
            root.elements.gst_age_to,
            root.elements.gst_age
        ];

        const lst = function () {
            let fval = Number(from.value);
            if (Number.isNaN(fval)) return;

            let tval = Number(to.value);
            if (Number.isNaN(tval)) return;

            if (tval < fval) return;

            let trimester_ret = 1;
            if (fval < 14) trimester_ret = 1;
            else if (fval < 28) trimester_ret = 2;
            else trimester_ret = 3;

            trimester.value = String(trimester_ret);
        }

        for (const e of ["change", "input"]) {
            from.addEventListener(e, lst);
            to.addEventListener(e, lst);
        }
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initFetusDynamicForm2(root) {
        const values =
            FILLED.fetus_values?.length ?
                FILLED.fetus_values :
                PREFILL_FETUS;
        // FILLED.fetus_values ?? [];
        // const flatten = values.map((e, i) => flattenToInlineKeys(e, `fetus_values[${i}]`));
        // const existing = flattenToInlineKeys(FILLED.fetus_values ?? [], 'fetus_values');
        // console.log(flatten);

        /** @type {FetusForm[]} */
        const forms = [];

        /** @type {HTMLElement} */
        const container = $(root).find("#fetus-additional-form").get(0);

        /** @type {HTMLButtonElement} */
        const addbtn = $(root).find("#add-fetus").get(0);

        /** @type {HTMLInputElement} */
        const countinp = $(root).find("#fetus_count").get(0);
        const updateCounter = () => {
            countinp.value = String(forms.length);
            countinp.dispatchEvent(new Event("change"));
        };
        countinp.addEventListener("change", () => updatePreview());

        const $preview = $(root).find("#fetus-values-raw");
        const updatePreview = () => $preview.text(jmarshall(forms.map(e => e.value), 4));

        const create_form = (index, base = randomString()) => {
            const form = new FetusForm(index, base);
            form.render(container);
            form.addEventListener("remove", function () {
                forms.splice(form.index, 1);
                for (let i = 0; i < forms.length; i++)
                    forms[i].index = i;

                updateCounter();
            });
            form.addEventListener("change", updatePreview);

            forms[index] = form;
            updateCounter();
            return form;
        };
        addbtn.addEventListener("click", () => {
            let n = Number(countinp.value || 0);
            create_form(n);

            countinp.value = String(forms.length);
            countinp.dispatchEvent(new Event("change"));
        });

        for (let i = 0; i < values.length; i++) {
            const raw = values[i];
            // const value = flatten[i];

            const form = create_form(i, raw.ref);
            form.value = raw;
        }
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initEducations(root) {
        const fieldset = root.elements.educations;
        const c1 = root.elements["consul-1"];
        const others = [...root.elements["consul[]"]].filter(e => e.id !== c1.id);

        const fn = () => {
            const fd = new FormData(root);
            const values = fd.getAll("consul[]");

            c1.disabled = !!values.length;
        }

        if (c1.checked) fieldset.disabled = c1.checked;
        else fn();

        c1.addEventListener("change", () => fieldset.disabled = c1.checked);
        others.forEach(e => e.addEventListener("change", fn));
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initQuisioneir(root) {
        const qs = flattenToInlineKeys(FILLED.quesioneir ?? {}, 'quesioneir');

        for (const k in qs) {
            const inp = root.elements[k];
            if (!inp) return;

            if (inp.type === 'checkbox')
                inp.checked = qs[k] === 'on';
        }
    }

    /**
     * `IMT = BMI`
     * @param {HTMLFormElement} root
     */
    function initImt(root) {
        const bmi = root.elements.ttv_bmi;
        const incrementIntrp = root.elements.ttv_bb_increase;

        bmi.addEventListener("change", function () {
            const val = Number(bmi.value || 0);
            incrementIntrp.value =
                val >= 30 ? "OV000008" :
                    val >= 25 && val < 30 ? "OV000009" :
                        val >= 18.5 && val < 25 ? "OV000010" :
                            /* val >= 11.5 && val < 18.5 ? */ "OV000011";
            $(incrementIntrp).trigger("change");
        });
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initLila(root) {
        const mt_type = root.elements.qs_q1s2;
        const mt = root.elements.qs_q1s1
        const lila = root.elements.ttv_lila;

        mt.addEventListener("change", () => mt_type.disabled = !mt.checked);

        let lila_change
        $(lila)
            .on("keypress", (lila_change = () => {
                let val = Number(lila.value || 0);
                if (Number.isNaN(val)) val = 0;

                const lt23_5 = val < 23.5;
                mt.disabled = !lt23_5;
                if (lt23_5) {
                    mt.checked = false;
                    mt.dispatchEvent(new Event("change"));
                }
            }))
            .on("change", lila_change)
        // lila.addEventListener("change", );

        lila.dispatchEvent(new Event("change"));
    }

    /**
     * @param {HTMLFormElement} root
     */
    function initHPL(root) {
        const hpl = root.elements.eoc_hpl;
        const hpht = root.elements.eoc_hpht;
        hpht.addEventListener("input", function () {
            if (!hpht.valueAsDate) return;

            /** @type {Date} */
            let dt = hpht.valueAsDate
            dt.setDate(dt.getDate() + 280 /* 280 hari */);
            hpl.valueAsDate = dt;
        });


        // if (!hpht.value) {
        //     hpht.valueAsDate = new Date();
        //     hpht.dispatchEvent(new Event("input"));
        // }
    }

    function prefills(root) {
        if (Object.keys(FILLED) < 1)
            return;

        const set = (name, value) => {
            let elm;
            if (!(elm = root.elements[name])) return;

            try {
                elm.value = value;
                elm.dispatchEvent(new Event("change"));
            } catch (error) {
                throw new TypeError(`[${name}] ${error.message}`);
            }
        }

        const {
            eoc_visite = 0,
            eoc_ended = false,
            eoc_hpht,
            eoc_hpl,
            fetus_values,
            ...others
        } = PREFILL;

        set("eoc_visite", (eoc_ended ? 0 : eoc_visite) + 1);
        set("eoc_hpht", eoc_hpht);
        set("eoc_hpl", eoc_hpl);
        Object.entries(others).forEach(([k, v]) => set(k, v || 0));
    }

    return {
        init(root) {
            initInputTypeNumber(root);
            $(root)
                .find("select[data-display]")
                .each((i, e) => initAttrDataDisplay(e, root));

            initEocVisiteDateTime(root);
            initEocTrimester(root);
            initHPL(root);
            // initFetusDynamicForm(root);
            initFetusDynamicForm2(root);
            initEducations(root);
            initQuisioneir(root);
            initImt(root);
            initLila(root);

            initAttrDataMedian(root.elements.usg_age);
            initAttrDataMedian(root.elements.gst_age);

            prefills(root);
        }
    };
})();

$(document).ready(function () {
    const root = document.getElementById("anc-form");
    setTimeout(() => {
        AntenatalCare.init(root);
        // $(root).find("details").prop("open", true);
    }, 100);
});
