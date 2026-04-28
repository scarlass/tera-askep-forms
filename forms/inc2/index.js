function inc_log(e) {
    /** @type {HTMLInputElement} */
    const elm = e.target;
    console.log([
        elm.value,
        elm.valueAsDate,
    ]);
}


const IntranatalCare = window.IntranatalCare = (() => {

    const isUnresolved = (tmpl, name) => {
        const s = tmpl.slice(1, -1);
        return s === name;
    };

    const normalize = (tmpl, name, defal = {}) => {
        return isUnresolved(tmpl, name) ? defal : JSON.parse(tmpl);
    };

    /**
     * @template T
     * @param {(...args: T) => void} cb
     * @param {number} [delay] in milisecond
     * @returns {(...args: T) => void}
     */
    function debouncer(cb, delay = 300) {
        let t = null;
        return function update(...args) {
            if (t != null) clearTimeout(t);
            t = setTimeout(function () {
                cb(...args);
                t = null;
            }, delay);
        }
    }

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
     * @param  {HTMLInputElement} target
     * @param  {HTMLElement|Document|JQuery} root
     */
    function initAttrDataMedian(target, root = document) {
        // if (target.dataset.medianStart && target.dataset.medianEnd) {
        //     const { medianStart, medianEnd } = target.dataset;
        // } else {
        const $inputs = $(`input[data-range-median="${target.id}"]`, root);
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
     *
     * @param {HTMLFieldSetElement} fs
     */
    function initApgarSection(fs) {
        const name = fs.name;

        /** @type {HTMLSelectElement} */
        const appearance = fs.elements[`${name}-appearance`];
        /** @type {HTMLSelectElement} */
        const pulse = fs.elements[`${name}-pulse`];
        /** @type {HTMLSelectElement} */
        const grimace = fs.elements[`${name}-grimace`];
        /** @type {HTMLSelectElement} */
        const activity = fs.elements[`${name}-activity`];
        /** @type {HTMLSelectElement} */
        const respiration = fs.elements[`${name}-respiration`];

        const score = fs.elements[`${name}-score`];
        const scoreIntrp = fs.elements[`${name}-score-intrp`];

        score.value = "0";
        score.addEventListener("change", function (e) {
            let n = Number(score.value);
            if (Number.isNaN(n)) n = 0;

            const index = n < 4 ? 1 : n < 7 ? 2 : 3
            scoreIntrp.value = scoreIntrp.options.item(index).value;
        });

        let selects = [appearance, pulse, grimace, activity, respiration];
        for (const elm of selects) {
            elm.addEventListener('change', function (e) {
                const n = selects
                    .map(e => Number(e.selectedOptions.item(0)?.dataset.score ?? 0))
                    .filter(e => typeof e !== 'undefined')
                    .reduce((a, b) => a + b, 0);

                score.value = String(n);
                score.dispatchEvent(new Event("change"));
            });
        }
    }

    /** @param {HTMLFormElement} root */
    function initChildBodyWeight(root) {
        /**
         * @type {{
         *  system: string;
         *  code: string;
         *  display: string;
         *  visual?: string;
         * }[]}
         */
        const INC_BAYI_BERATBADAN = normalize(`{INC_BAYI_BERATBADAN}`, 'INC_BAYI_BERATBADAN', []);

        /** @type {HTMLInputElement} */
        const bb = root.elements.child_bb;

        /** @type {HTMLSelectElement} */
        const intrpCode = root.elements.child_bb_intrp_code;
        /** @type {HTMLInputElement} */
        const intrpSystem = root.elements.child_bb_intrp_system;
        /** @type {HTMLInputElement} */
        const intrpDisplay = root.elements.child_bb_intrp_display;

        for (const { system, code, display, visual } of INC_BAYI_BERATBADAN) {
            const opt = new Option(visual || display || code, code);
            opt.dataset.system = system;
            opt.dataset.display = display;

            // INC_BAYI_BERATBADAN[code] = opt;
            intrpCode.options.add(opt);
        }

        let fn;
        bb.addEventListener("change", (fn = function (e) {
            if (!bb.value) {
                intrpCode.value = "";
                intrpSystem.value = "";
                intrpDisplay.value = "";
                return;
            }

            const n = Number(bb.value || 0);

            let selected = n < 1000 ? "276612004" :
                n < 1500 ? "276611006" :
                    n < 2500 ? "276610007" :
                        n < 4000 ? "276712009" : "276613009";

            intrpCode.value = selected;
            const opt = intrpCode.selectedOptions.item(0);
            intrpSystem.value = opt.dataset.system;
            intrpDisplay.value = opt.dataset.display;

            intrpCode.dispatchEvent(new Event("change"));
        }));

        let fnd = debouncer(fn);
        bb.addEventListener("input", fnd);
    }

    /**
     * IMD = Inisiasi Menyusui Dini
     *
     * @param {HTMLFormElement} root
     */
    function initImd(root) {
        /** @type {HTMLInputElement} */
        const y = root.elements.child_feed_on;
        const n = root.elements.child_feed_off;

        /** @type {HTMLSelectElement} */
        const timespan = root.elements.child_feed_timespan
        y.addEventListener("change", () => {
            if (!y.checked) return;
            timespan.disabled = false;
        });
        n.addEventListener("change", () => {
            if (!n.checked) return;
            timespan.disabled = true;
            timespan.value = ""
        });

        y.dispatchEvent(new Event("change"));
        n.dispatchEvent(new Event("change"));

        console.log({ y, n, timespan });
    }

    return {
        /**
         * @param {HTMLFormElement} root
         */
        init(root) {
            initAttrDataMedian(root.elements.pregnancy_age);
            initInputTypeNumber(root);

            initApgarSection(root.elements["apgar-1"]);
            initApgarSection(root.elements["apgar-5"]);
            initApgarSection(root.elements["apgar-10"]);
            initChildBodyWeight(root);
            initImd(root);
        }
    }
})();

$(document).ready(function () {
    const root = document.getElementById("inc-form");
    setTimeout(() => {
        IntranatalCare.init(root);

        let open_all = false;
        open_all && $(root).find("details")
            .prop("open", true)
            .find("summary")
            .prop("tabindex", "-1");
    }, 100)
});
