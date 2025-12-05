(function (mod) {
    window.SatusehatInc = mod(window);
})(function (/** @type {Window & globalThis} */ win) {
    const ce = new Event("change");

    const isUnresolved = (tmpl, name) => {
        const s = tmpl.slice(1, -1);
        return s === name;
    };

    const normalize = (tmpl, name, defal = {}) => {
        return isUnresolved(tmpl, name) ? defal : JSON.parse(tmpl);
    };

    /** @type {{id: number; display: string}[]} */
    let INC_APGAR_SCORE_INTRP = `{INC_APGAR_SCORE_INTRP}`;
    INC_APGAR_SCORE_INTRP = normalize(
        INC_APGAR_SCORE_INTRP,
        "INC_APGAR_SCORE_INTRP",
        [],
    );

    let INC_BAYI_BB_INTRP = `{INC_BAYI_BB_INTRP}`;
    INC_BAYI_BB_INTRP = normalize(INC_BAYI_BB_INTRP, "INC_BAYI_BB_INTRP", []);
    INC_BAYI_BB_INTRP = Object.fromEntries(
        INC_BAYI_BB_INTRP.map((v) => {
            const key = v.display.split(" ", 2)[0];
            return [key, v];
        }),
    );

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

    function initNumericOnly(root) {
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
    }

    /**
     *
     * @param {HTMLFormElement} root
     */
    function syncChildFeeding(root) {
        /** @type {HTMLInputElement} */
        const src = root.elements["child_feed"];

        /** @type {HTMLSelectElement} */
        const dest = root.elements["child_feed_timespan"];

        src.addEventListener("change", () => {
            console.log({ src, dest });
            dest.disabled = !src.checked;
        });
        dest.disabled = !src.checked;
    }

    function syncChildBb(root) {
        const bb = root.elements["child_bb"];

        /** @type {HTMLSelectElement} */
        const intrp = root.elements["child_bb_intrp"];

        const proc = () => {
            const v = Number(bb.value);
            if (Number.isNaN(v)) {
                intrp.value = "";
            } else {
                console.log("bb score =>%d", v);
                // prettier-ignore
                const index =
                    v >= 4000 ? 1 :
                    v >= 2500 ? 2 :
                    v >= 1500 ? 3 :
                    v >= 1000 ? 4 : 5;

                console.log(
                    "bb score => %d / %d",
                    v,
                    index,
                    intrp.options.length,
                );

                // const index =
                //     v < 1000 ? 5 :
                //     v < 1500 ? 4 :
                //     v < 2500 ? 3 :
                //     v < 4000 ? 2 : 1

                intrp.value = intrp.options.item(index)?.value;
            }
        };

        bb.addEventListener("input", proc);
        proc();
    }

    /**
     *
     * @param {HTMLFormElement} root
     * @param {1|5|10} minute
     */
    function syncApgarScore(root, minute) {
        const prefix = `apgar${minute}`;

        /** @type {HTMLSelectElement} */
        const skin = root.elements[prefix + "_skin"];
        const pulse = root.elements[prefix + "_pulse"];
        const grimace = root.elements[prefix + "_grimace"];
        const respiration = root.elements[prefix + "_respiration"];
        const activity = root.elements[prefix + "_activity"];

        /** @type {HTMLSelectElement} */
        const total = root.elements[prefix + "_score"];
        /** @type {HTMLSelectElement} */
        const totalIntrp = root.elements[prefix + "_score_intrp"];

        /** @type {HTMLSelectElement[]} */
        const fields = [skin, pulse, grimace, respiration, activity];

        const proc = () => {
            let score = 0;
            for (const slc of fields) {
                const opt = slc.selectedOptions.item(0);
                if (!opt) continue;

                console.log("apgar score (%s) - %d", minute, score);
                score += Number(opt.getAttribute("data-score"));
            }

            // prettier-ignore
            const index =
                score < 4 ? 0 : // 0-3
                score < 7 ? 1 : 2 // 4-6 : 7-10
            // score < 10 ? 2 : 0 // 7-10

            // prettier-ignore
            const bg =
                score < 4 ? "danger" : // 0-3
                score < 7 ? "warn" : // 4-6
                "good" // 7-10

            total.value = String(score);
            totalIntrp.value = totalIntrp.options.item(index).value;

            $(total.closest(".apgar-score"))
                .removeClass("danger")
                .removeClass("warn")
                .removeClass("good")
                .addClass(bg);
        };

        // prettier-ignore
        for (const slc of fields)
            slc.addEventListener("change", proc);

        proc();

        // const prefix = `apgar${minute}_score`;

        // const score = root.elements[prefix];

        // /** @type {HTMLSelectElement} */
        // const intrp = root.elements[prefix + "_intrp"];

        // const proc = () => {
        //     const v = Number(score.value);
        //     if (Number.isNaN(v)) {
        //         intrp.value = "";
        //     } else {
        //         const get = (n) => intrp.options.item(n).value;

        //         // prettier-ignore
        //         const index =
        //             v < 4 ? 1 :
        //             v < 7 ? 2 :
        //             v < 10 ? 3 : 0

        //         intrp.value = get(index);
        //     }
        // };

        // score.addEventListener("input", proc);
        // proc();
    }

    return {
        init(root) {
            initNumericOnly(root);
            initDatepickers(root);
            initTimepickers(root);

            syncChildFeeding(root);
            syncChildBb(root);

            syncApgarScore(root, 1);
            syncApgarScore(root, 5);
            syncApgarScore(root, 10);
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
    setTimeout(() => SatusehatInc.init(root), 1000);
});
