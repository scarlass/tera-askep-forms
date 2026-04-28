import { readFileSync, writeFileSync } from "node:fs";
import * as process from "node:process";
import * as fs from "node:fs";
import { TEMPLATE_PLACEHOLDER, AGES, AGES_LEN, TYPE, ROWS } from "./conf.js";
import path from "node:path";

const stylhide = { style: 'display: none;' }
export const FIELDS = {
    "filled:shadow": { type: "checkbox", 'data-readonly': true },
    "filled": { type: "text", value: 'f', 'data-type': 'boolean', /*'data-shadowed': true,*/ ...stylhide },

    "praktik-tanggal": { type: "text", ...stylhide },
    "praktik-waktu": { type: "text", ...stylhide },
    "deskripsi": { type: "text", ...stylhide },

    "vaksin": { type: "text", ...stylhide },
    "vaksin-exp": { type: "text", ...stylhide },
    "vaksin-dosis": { type: "text", ...stylhide },
    "vaksin-dosis-unit": { type: "text", ...stylhide },

    "perawat": { type: "text", ...stylhide },

    "program": { type: "text", ...stylhide },

    "kipi-check": { type: "text", 'data-type': 'boolean', ...stylhide },
    "kipi-kode": { type: "text", ...stylhide },

    // "diagnosa": { type: "text", ...stylhide },
}

const isArray = Array.isArray;
const isMonths = (n) => n < 12;

/** @param {string} title */
const gen_slug = (title) => title.replaceAll(/(\/| )/g, "-").toLowerCase();

/**
 *
 * @param {object} arg0
 * @param {string} arg0.key
 * @param {number} arg0.n
 * @param {string} arg0.namespace
 * @param {string[]} [arg0.dialogues_ctn]
 * @param {number} [arg0.span]
 * @param {string} [arg0.text]
 */
const gen_col = ({ key, n, namespace, span = 0, text, dialogues_ctn }) => {
    const age_unit = isMonths(n) ? "b" : "t";
    const age = age_unit + AGES[n];

    namespace = namespace + `.` + age;
    console.log(namespace, { key: TYPE[key], n });

    const [filled_shadow, ...inputs] = Object.entries(FIELDS)
        .map(([suffix, atrs], i) => {
            const full_path = [...namespace.split('.'), suffix].join('_');

            const asShadow = suffix.endsWith(':shadow');
            atrs = {
                id: full_path,
                name: full_path,
                myid: asShadow ? null : 'check_cara',
                'data-namespace-field': asShadow ? null : suffix,
                ...atrs,
            }

            const attributes = Object.entries(atrs)
                .map((e) => {
                    const [k, v] = e;
                    if (v) {
                        if (typeof v === "boolean")
                            return k;

                        return `${k}="${v.toString()}"`;
                    }
                    return null;
                })
                .filter(Boolean);

            return `<input ${attributes.join(" ")} />`;
        });

    return `${"    ".repeat(3)}<td
        colspan="${span}"
        style="text-align: center; vertical-align: middle;"
        data-type="${TYPE[key]}"
        data-namespace="${namespace}"
    >
        <button
            type="button"
            class="btn trigger"
            onclick="open_window_form('${namespace}')"
            data-filled="false"
        >
            <i class="fa fa-check"></i>
            <span class="description" style="font-weight: 680;">${text || ''}</span>
        </button>
        ${inputs.join("\n" + "    ".repeat(3))}
    </td>`;
};

const gen_default_row = () =>
    `<td style="text-align: center; vertical-align: middle"></td>`;

/**
 *
 * @param {object} arg0
 * @param {string} arg0.slug
 * @param {ColOpt} arg0.opt
 * @param {string} [arg0.namespace]
 * @param {number} [arg0.span]
 */
const gen_row_opt = ({ slug, opt, namespace }) => {
    let cols = Array(AGES_LEN).fill(gen_default_row());

    namespace = slug + (namespace ? "." + namespace : "");

    for (const key in opt) {
        const col = opt[key];
        for (const c of col) {
            // console.log('[%s] %s', slug, TYPE[key], c);
            if (!isArray(c)) {
                cols[c] = gen_col({ key, namespace, n: c, text: c.text });
            } else {
                const [s, e] = c;
                let end_index = e < 0 ? (cols.length - 1) : e;

                if (!c.merged) {
                    for (let i = s; i <= end_index; i++) {
                        cols[i] = gen_col({ key, namespace, n: i });
                    }
                } else {
                    for (let i = s; i <= end_index; i++) {
                        cols[i] = `{#}`;
                    }

                    cols[s] = gen_col({
                        key,
                        namespace, n: s,
                        span: (end_index + 1) - s,
                        text: c.text
                    });
                }
            }
        }
    }

    cols = cols.filter(e => e !== '{#}');
    return cols.join("\n");
};

export default function generateV1(cwd, source, output) {
    const TEMPLATES = [];
    for (const row of ROWS) {
        if (!isArray(row)) {
            TEMPLATES.push(
                `<tr>
                    <th>${row}</th>
                    ${gen_default_row().repeat(AGES_LEN)}
                </tr>`,
            );
            continue;
        }

        let [title, _opt] = row;
        const slug = gen_slug(title);

        if (isArray(_opt)) {
            const [opt1, ...optRest] = _opt;

            // console.log(title, _opt[0], _opt[1]);

            const namespace_b = (n) => `r${n + 1}`;
            const struct = [
                `<tr>
                    <th rowspan="${_opt.length}">${title}</th>
                    ${gen_row_opt({ slug, opt: opt1, namespace: namespace_b(0) })}
                </tr>`,
            ];

            struct.push(
                ...optRest
                    .map((opt, i) =>
                        `<tr>${gen_row_opt({ slug, opt, namespace: namespace_b(i + 1) })}</tr>`
                    ),
            );
            TEMPLATES.push(struct.join("\n"));
        } else {
            const struct = [
                "<tr>",
                `<th>${title}</th>`,
                gen_row_opt({ slug, opt: _opt }),
                "</tr>",
            ];
            TEMPLATES.push(struct.join("\n"));
        }
    }

    if (path.isAbsolute(source))
        throw new Error("source path must be relative");
    if (path.isAbsolute(output))
        throw new Error("output path must be relative");

    source = path.join(cwd, source);
    output = path.join(cwd, output);

    console.log("File Source => %s", path.relative(process.cwd(), source));
    console.log("File Output => %s", path.relative(process.cwd(), output));

    const content = (() => {
        let content = readFileSync(source, "utf8");
        return content.replace(TEMPLATE_PLACEHOLDER, TEMPLATES.join("\n"));
    })();

    if (!fs.existsSync(path.dirname(output))) {
        fs.mkdirSync(path.dirname(output), { recursive: true });
    }

    writeFileSync(output, content);
    console.log("generate output can be seen in \n => %s", path.relative(process.cwd(), output));
}
