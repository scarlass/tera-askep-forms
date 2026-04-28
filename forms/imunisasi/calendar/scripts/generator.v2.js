import * as fs from "node:fs";
import * as util from "node:util";
import path from "node:path";
import { AGES, AGES_LEN, ROWS, TYPE, TEMPLATE_PLACEHOLDER, TEMPLATE_PLACEHOLDER_FILLABLE } from "./conf.js";

export default function generatorV2(cwd, source, output) {
    const gen = new GeneratorV2(cwd, source, output);

    gen.render();
}

const isMonths = (n) => n < 12;

const FILLABLE_FIELDS = [
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

class GeneratorV2 {
    cwd = "";
    source = "";
    output = "";

    content_source = "";
    content_index = 0;
    content_space = 0;

    constructor(cwd, source, output) {
        this.cwd = cwd;
        this.source = source;
        this.output = output;

        this.content_source = (() => {
            let content = fs.readFileSync(source, "utf8");
            let idx = content.indexOf(TEMPLATE_PLACEHOLDER);
            this.content_index = idx;

            for (let i = idx; i > 0; i--) {
                let c = content[i];
                if (c === "\n" || c === "\r") {
                    this.content_space = idx - i - 1;
                    break;
                };
            }


            return content;
        })();
    }

    slug(title) { return title.replaceAll(/(\/| )/g, "-").toLowerCase(); }

    /**
     *
     * @param {string} text
     * @param {number} [space]
     * @returns {string}
     */
    spacing(text, space = 4) {
        return " ".repeat(space) + text;
    }

    spacing_recursive(content, { space = 4, initial = this.content_space } = {}, depth = 0) {
        space ??= 4
        initial ??= this.content_space;

        if (typeof content === "string" || typeof content === "number" || typeof content === "boolean") {
            if (depth === 0)
                return this.spacing(content, initial);
            return this.spacing(this.spacing(content, space * depth), initial);
        } else if (Array.isArray(content)) {
            for (let i = 0; i < content.length; i++) {
                content[i] = this.spacing_recursive(content[i], { space, initial }, depth + 1);
            }
            return content;
        }

        throw new Error(`Invalid content value type: ${typeof content}`);
    }

    join_recursive(content) {
        if (typeof content === "string" || typeof content === "number" || typeof content === "boolean") {
            return content;
        } else if (Array.isArray(content)) {
            return content.map(e => this.join_recursive(e)).join("\n");
        }

        throw new Error(`Invalid content value type: ${typeof content}`);
    }

    base_col() {
        return `<td style="text-align: center; vertical-align: middle"></td>`;
    }


    /**
     *
     * @param {object} arg0
     * @param {string} arg0.key
     * @param {number} arg0.age
     * @param {string} arg0.ns
     * @param {number} [arg0.span]
     * @param {string} [arg0.text]
     */
    gen_col({ key, age: ageidx, ns: namespace, span = 0, text }) {
        const age_unit = isMonths(ageidx) ? "b" : "t";
        const age = age_unit + AGES[ageidx];

        const ns = namespace + `[${age}]`;

        //metadata
        const md_type = `data-type="${TYPE[key]}"`;
        const md = `data-namespace="${namespace}" data-age="${age}" ${md_type}`;
        return [
            `<td colspan="${span}" style="text-align: center; vertical-align: middle;" ${md}>`,
            [
                `<button type="button" id="${namespace}-${age}-popup" class="btn trigger" ${md} data-filled="false" onclick="namespace_open('${namespace}', '${age}')">`,
                [
                    `<i class="fa fa-check"></i>`,
                    `<span class="description" style="font-weight">${text || ''}</span>`
                ],
                `</button>`,
                `<fieldset name="${ns}" style="display: contents !important;" ${md}>`,
                [
                    `<!-- ${ns} inputs -->`,
                    `<input myid="check_cara" type="hidden" name="${ns}[namespace]" value="${namespace}" />`,
                    `<input myid="check_cara" type="hidden" name="${ns}[age]" value="${age}" />`,
                    `<input myid="check_cara" type="hidden" name="${ns}[type]" value="${TYPE[key]}" />`,

                    ...FILLABLE_FIELDS.map(name =>
                        `<input myid="check_cara" type="hidden" data-field="${name}" name="${ns}[${name}]" />`
                    ),
                ],
                `</fieldset>`
            ],
            `</td>`,
        ];
    }

    /**
     *
     * @param {object} param0
     * @param {string} param0.slug
     * @param {ColOpt} param0.opt
     * @param {string} [param0.vaksin]
     * @param {string} [param0.namespace]
     */
    gen_row({ slug, opt, namespace: ns }) {
        let cols = Array(AGES_LEN).fill(this.base_col());

        ns = slug + (ns ? `[${ns}]` : "");

        for (const key in opt) {
            const col = opt[key];
            for (const c of col) {
                if (!Array.isArray(c)) {
                    cols[c] = this.gen_col({
                        key,
                        ns: ns, age: c,
                        text: c.text
                    });
                } else {
                    const [s, e] = c;
                    let eidx = e < 0 ? (cols.length - 1) : e;

                    if (!c.merged) {
                        for (let i = s; i <= eidx; i++) {
                            cols[i] = this.gen_col({
                                key,
                                ns: ns, age: i,
                            });
                        }
                    } else {
                        for (let i = s; i <= eidx; i++) {
                            cols[i] = "{#}";
                        }

                        cols[s] = this.gen_col({
                            key,
                            ns: ns, age: s,
                            span: eidx + 1 - s,
                            text: c.text
                        });
                    }
                }
            }
        }

        cols = cols.filter(e => e !== `{#}`);
        return cols.map(e => Array.isArray(e) ? e : [e]);
    }

    render() {
        let rendered = [];

        for (const row of ROWS) {
            if (!Array.isArray(row)) {
                rendered.push(
                    '<tr>',
                    [
                        `<th>${row}</th>`,
                        ...(new Array(AGES_LEN).fill(this.base_col())
                        ),
                    ],
                    '</tr>'
                );
                continue;
            }

            let [title, _opt] = row;
            const slug = this.slug(title);

            if (Array.isArray(_opt)) {
                const [subopt, ...opt_rest] = _opt;
            } else {
                console.log({ row, opt: _opt });
                rendered.push(
                    '<tr>',
                    [
                        `<th>${title}</th>`,
                        ...this.gen_row({ slug, opt: _opt }).flatMap(e => e),
                    ],
                    '</tr>',
                );
            }
        }

        console.log({ content_space: this.content_space, offset: this.content_index });
        rendered = this.spacing_recursive(rendered);
        rendered[0] = rendered[0].trim();
        rendered = this.join_recursive(rendered);

        // console.log(util.formatWithOptions({ colors: true, depth: 10 }, rendered));

        let newcontent = this.content_source;
        newcontent = newcontent.replace(TEMPLATE_PLACEHOLDER, rendered);
        newcontent = newcontent.replace(TEMPLATE_PLACEHOLDER_FILLABLE, JSON.stringify(FILLABLE_FIELDS));

        let output = this.output;
        if (!fs.existsSync(path.dirname(output))) {
            fs.mkdirSync(path.dirname(output), { recursive: true });
        }

        fs.writeFileSync(output, newcontent);
        console.log("generate output can be seen in \n => %s", path.relative(process.cwd(), output));
        // return rendered.map(e => this.spacing(e, this.content_space));
    }
}
