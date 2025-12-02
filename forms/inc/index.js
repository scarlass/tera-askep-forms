(function (mod) {
    window.SatusehatInc = mod(window);
})(function (/** @type {Window & globalThis} */ win) {
    const ce = new Event("change");

    /**
     * @template T
     * @param {T} v
     * @returns {T is Exclude<T, null | undefined | void>}
     */
    const isDefined = (v) => {
        return (
            typeof v !== "undefined" && {}.toString.call(v) !== "[object Null]"
        );
    };

    const padleft = (n) => {
        if (!isDefined(n)) return "";
        return String(n).padStart(2, "0");
    };

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
                    timeFormat: "HH:mm",
                });
            });
    }

    return {
        init(root) {
            initDatepickers(root);
            initTimepickers(root);
        },

        /**
         *
         * @param {'all'|'date'|'time'} segment
         * @param {HTMLInputElement} elm
         */
        syncLaborDateTime(segment, elm) {
            if (!isDefined(elm)) return;

            /**
             * @returns {[HTMLInputElement, Date]}
             */
            const extract = () => {
                const datetimeElm =
                    win.document.getElementById("labor_datetime");

                /** @type {string|Date} */
                let datetime = datetimeElm.value;
                if (datetime) {
                    datetime = new Date(datetime);
                } else {
                    datetime = new Date();
                }

                console.log("-->", datetime);
                return [elm, datetime];
            };

            console.log(segment, elm);
            if (segment === "all") {
                // expect date time value format in ISO8601
                // const dt = new Date(elm.value || Date.now());
                // console.log(elm.value);
                // // prettier-ignore
                // $("#labor_date").val([
                //     padleft(dt.getDate()),
                //     padleft(dt.getMonth()),
                //     dt.getFullYear(),
                // ].join("-"));
                // // prettier-ignore
                // $("#labor_time").val([
                //     padleft(dt.getHours()),
                //     padleft(dt.getMinutes())
                // ].join(":"));
            } else if (segment === "date") {
                const [datetimeElm, datetime] = extract();

                const [date, month, year] = elm.value.split("-");
                datetime.setDate(date);
                datetime.setMonth(month);
                datetime.setFullYear(year);

                datetimeElm.value = datetime.toString();
                datetimeElm.dispatchEvent(ce);
            } else if (segment === "time") {
                const [datetimeElm, datetime] = extract();

                let [hour, minute] = elm.value.split(":");
                hour = Number(hour);
                minute = Number(minute);

                console.log(segment, [hour, minute]);
                datetime.setHours(hour, minute);

                console.log(segment, datetime.toISOString());
                // datetimeElm.value = datetime.toISOString();
                // datetimeElm.dispatchEvent(ce);
            }
        },
    };
});

$(document).ready(function () {
    const root = document.getElementById("inc-form");
    setTimeout(() => {
        SatusehatInc.init(root);
    }, 1000);
});
