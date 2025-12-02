(function (win, $, mod) {
    try {
        win.SatusehatAntenatal = mod(win, $);
    } catch (err) {
        console.error("namespace initialization", err);
    }
})(window, jQuery, function (win, $) {
    const ce = new Event("change");

    /**
     *
     * @param {string} tmpl
     * @param {string} name
     */
    const isUnresolved = (tmpl, name) => {
        const s = tmpl.slice(1, -1);
        return s === name;
    };

    const normalize = (tmpl, name, defal = {}) => {
        return isUnresolved(tmpl, name) ? defal : JSON.parse(tmpl);
    };

    let PATH = `{RELPATH}`;

    let PREFILL = `{ANC_PREFILL}`;
    PREFILL = normalize(PREFILL, "ANC_PREFILL");

    let DATAJSON = `{MYJSON}`;
    DATAJSON = normalize(DATAJSON, "MYJSON");
    // const url = new URL(window.location.href);

    // console.log("templated values =>", { PATH, PREFILL, DATAJSON });

    /**
     *
     * @param {HTMLFormElement} root
     */
    function init(root) {
        // console.log(root.elements);
        // const $form = $(root);

        PREFILL.eoc_visite = Number(PREFILL.eoc_visite ?? 0) + 1;
        // console.log("Last Data =>", PREFILL);

        const autofills = {
            eoc_visite: 0,
            obstetri_gravida: 0,
            obstetri_partus: 0,
            obstetri_abortus: 0,
            ttv_bp_systolic: 0,
            ttv_bp_diastolic: 0,
            ttv_temp: 0,
            ttv_pulse: 0,
            ttv_weight: 0,
            ttv_lila: 0,
            ttv_lila_intrp: 0,
        };

        for (const [key, def] of Object.entries(autofills)) {
            const input = root.elements[key];

            if (input instanceof HTMLInputElement && !input.value) {
                input.value = PREFILL[key] || String(def);
                input.dispatchEvent(new Event("change"));
            }
        }
    }

    /**
     *
     * @param {HTMLFormElement} root
     */
    function initElements(root) {
        root.addEventListener("change", (e) => {
            console.log("changed on field", e.target.name);
        });

        initDatepickers(root);
        initTimepickers(root);
        initSelectors(root);
        initSelectDisplayInterpretation(root);

        $(root)
            .find("input[inputmode=numeric]")
            .each(function (i, /** @type {HTMLInputElement} */ el) {
                const $el = $(el);

                // $el.attribute("mytype", "int");
                $el.keypress(function (je) {
                    /** @type {KeyboardEvent} */
                    const e = je.originalEvent;
                    if (!/[.0-9]/.test(e.key)) {
                        e.preventDefault();
                        return;
                    } else {
                        if (e.key == "." && el.value.includes(".")) {
                            e.preventDefault();
                        }
                    }
                });
            });

        const hpht = root.elements["eoc_hpht"];

        hpht.addEventListener("change", (e) => {
            const current = e.currentTarget.value;

            console.log(current);
            if (current) {
                const date = new Date(Date.parse(current + "T00:00"));

                const birthday = naegeleBirthDayPredict(date);
                console.log(birthday);
                if (!birthday) return;

                const hpl = root.elements["eoc_hpl"];
                hpl.value = [
                    `${birthday.getFullYear()}`,
                    `${birthday.getMonth()}`.padStart(2, "0"),
                    `${birthday.getDate()}`.padStart(2, "0"),
                ].join("-");
                hpl.dispatchEvent(ce);
            }
        });

        integrateInit.lilaAndMt(root);
        integrateInit.consul(root);
    }

    function initDatepickers(root) {
        $(root)
            .find(".datepicker")
            .removeClass("hasDatepicker")
            .off("click.datepicker");

        if ($.fn.datepicker) {
            $(root)
                .find(".datepicker")
                .each(function (i) {
                    const self = $(this);

                    if (self.data("disabled")) return;

                    let dataDateFormat =
                        $(this).data("dateformat") || "yy-mm-dd";

                    // if (
                    //     self.closest(".collapsible-content").is(":hidden") &&
                    //     self.closest(".collapsible-content").length > 0
                    // ) {
                    //     return;
                    // }

                    self.datepicker({
                        dateFormat: dataDateFormat,
                        prevText: '<i class="fa fa-chevron-left"></i>',
                        nextText: '<i class="fa fa-chevron-right"></i>',
                        todayBtn: "linked",
                    });
                });
        }
    }

    function initTimepickers(root) {
        if (!$.fn.timepicker) return;
        $(root)
            .find(".timepicker")
            .each(function () {
                $(this).timepicker({
                    minuteStep: 1,
                    showMeridian: false,
                });
            });
    }

    function initSelectors(root) {
        $(root)
            .find(".select2")
            .each(function () {
                const $el = $(this);
                const options = {};

                if (this.disabled) {
                    options.disabled = true;
                }

                if ($el.data("allowClear")) {
                    options.allowClear = $el.data("allowClear") != "false";
                }

                $el.select2(options);
            });
    }

    function initSelectDisplayInterpretation(root) {
        $(root)
            .find("select[data-interpretation]")
            .each(function (i, /** @type {HTMLSelectElement} */ select) {
                const fn = function () {
                    const opt = select.selectedOptions.item(0);
                    if (!opt) return;

                    let intrp = $(opt).data("display");
                    if (!intrp) intrp = opt.innerText;

                    const elemRef = $(select).data("interpretation");
                    const elem = select.form.elements[elemRef];
                    if (!elem) return;

                    elem.value = intrp;
                    elem.dispatchEvent(new Event("change"));
                };

                fn();
                select.addEventListener("change", fn);
            });
    }

    const integrateInit = {
        /**
         *
         * @param {HTMLFormElement} root
         */
        lilaAndMt(root) {
            const inputs = root.elements;

            // const lila = inputs["ttv_lila"];
            // const intrp = inputs["ttv_lila_intrp"];
            // const intrpDisp = inputs["ttv_lila_intrp_display"];
            const mtAddt = inputs["quest_q1s1"];
            const mtType = inputs["quest_q1s2"];

            const syncLilaIntrpAndDisplay = function () {
                intrpDisp.value = intrp.value;
                intrpDisp.dispatchEvent(ce);
            };

            const syncLilaAndMtAddt = function () {
                const v = Number(lila.value);
                if (Number.isNaN(v) || v >= 23.5) {
                    mtAddt.disabled = true;
                    mtAddt.value = "";
                    mtAddt.dispatchEvent(ce);
                } else {
                    mtAddt.disabled = false;
                }
            };

            const syncMts = function () {
                mtType.disabled = !boolIntrpretation(mtAddt.value);
            };

            // syncLilaAndMtAddt();
            // lila.addEventListener("change", syncLilaAndMtAddt);

            // syncLilaIntrpAndDisplay();
            // intrp.addEventListener("change", syncLilaIntrpAndDisplay);

            syncMts();
            mtAddt.addEventListener("change", syncMts);
        },
        /**
         *
         * @param {HTMLFormElement} root
         */
        consul(root) {
            console.log("consul integration");

            const size = 7;

            const get = (n) => root.elements[`consul-${n + 1}`];
            const each = function (cb, from = 0) {
                for (let i = from; i < size; i++) {
                    cb?.(get(i));
                }
            };
            const prep = function (/** @type {HTMLElement} */ elm) {
                if (!elm) return;

                const id = elm.id;

                if (!id.startsWith("consul-")) return;

                // root.classList.remove;
                const accessibility = (elm, disable = false) => {
                    if (disable) {
                        elm.checked = false;
                        elm.disabled = true;
                        if (
                            !elm.parentElement.classList.contains("tw-disabled")
                        )
                            elm.parentElement.classList.add("tw-disabled");
                    } else {
                        elm.disabled = false;
                        if (elm.parentElement.classList.contains("tw-disabled"))
                            elm.parentElement.classList.remove("tw-disabled");
                    }
                };

                switch (id) {
                    case "consul-1":
                        //prettier-ignore
                        if (elm.checked)
                            each((e) => accessibility(e, true), 1);
                        else
                            each((e) => accessibility(e, false), 1);

                        break;
                    default:
                        if (elm.checked) {
                            accessibility(get(0), true);
                        } else {
                            const data = new FormData(root);
                            const size = data.getAll("consul[]").length;
                            if (size === 0) accessibility(get(0), false);
                        }
                }
            };

            each((elm) => {
                elm.addEventListener("change", () => prep(elm));
            });

            if (get(0).checked) {
                prep(get(0));
            } else {
                each((e) => prep(e), 1);
            }

            console.log("consul integration done");
        },
    };

    /**
     *     * @param {Date} hpht
     */
    function naegeleBirthDayPredict(hpht) {
        if (!hpht || !(hpht instanceof Date)) {
            return null;
        }

        const date = new Date(hpht);
        date.setFullYear(hpht.getFullYear() + 1);
        date.setMonth(hpht.getMonth() - 3);
        date.setDate(hpht.getDate() + 7);
        return date;
    }

    function boolIntrpretation(val) {
        if (typeof val === "string") {
            if (Number.isNaN(Number(val))) {
                return val.toLowerCase() === "on";
            }
        }

        if (typeof val === "number") {
            return val > 0;
        }

        return typeof val === "boolean" ? val : false;
    }

    return {
        get Data() {
            return DATAJSON;
        },
        init: init,
        initElements: initElements,
    };
});

$(document).ready(function () {
    setTimeout(() => {
        const form = document.getElementById("antenatal-form");
        try {
            SatusehatAntenatal.init(form);
            SatusehatAntenatal.initElements(form);
        } catch (err) {
            console.error("initialization error", err);
        }
    }, 1000);
});
