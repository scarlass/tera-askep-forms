(function (win, $) {
    let DATAJSON = "{MYJSON}";

    const url = new URL(window.location.href);
    function init() {
        try {
            DATAJSON = JSON.parse(DATAJSON);
        } catch (e) {
            // console.error(e);
            DATAJSON = {};
        }
    }

    function initElements(root) {
        initDatepickers(root);
        initTimepickers(root);
        initSelectors(root);
        initSelectDisplayInterpretation(root);

        // Disable input non-numeric for type="tel"
        $(root)
            .find("form[name=antenatal] input[inputmode=numeric]")
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

        $(root)
            .find("#eoc_hpht")
            .change(function (e) {
                /** @type {HTMLInputElement} */
                const self = $(this);

                const current = this.value;
                // console.log("#eoc_hpht", self.val());
                if (current) {
                    const date = new Date(Date.parse(current + "T00:00"));

                    // console.log("hpht ->", date);
                    const birthday = naegeleBirthDayPredict(date);
                    if (!birthday) return;

                    // console.log("hpl ->", birthday);
                    $("#eoc_hpl").val(
                        [
                            `${birthday.getFullYear()}`,
                            `${birthday.getMonth()}`.padStart(2, "0"),
                            `${birthday.getDate()}`.padStart(2, "0"),
                        ].join("-"),
                    );
                }
            });
    }

    function initDatepickers(root) {
        $(root)
            .find(".datepicker")
            .removeClass("hasDatepicker")
            .off("click.datepicker");

        if ($.fn.datepicker) {
            console.log("applying datepicker");
            $(root)
                .find(".datepicker")
                .each(function (i) {
                    console.log(this);

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

    /**
     *
     * @param {HTMLFormElement} root
     */
    function initSoapPrefill(root) {
        $(root).find("");
    }

    /**
     *
     * @param {Date} hpht
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

    win.SatusehatAntenatal = {
        get Data() {
            return DATAJSON;
        },
        init: init,
        initElements: initElements,
    };
})(window, jQuery);

$(document).ready(function () {
    SatusehatAntenatal.init();
    SatusehatAntenatal.initElements(document.getElementById("antenatal-form"));
});
