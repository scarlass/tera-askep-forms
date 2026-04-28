export const TEMPLATE_PLACEHOLDER = "{{ROWS}}";
export const TEMPLATE_PLACEHOLDER_FILLABLE = "{{FILLABLE}}";

export const TYPE = [
    "primer",       // 0 Primer
    "catch-up",     // 1 Catch-Up
    "booster",      // 2 Booster
    "endemis",      // 3 Daerah Endemis
    "high-risk",    // 4 Anak Risiko tinggi
];

export const AGES = [
    0, 1, 2, 3, 4, 5, 6, 9, 12, 15, 18, 24, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18,
];

export const AGES_LEN = AGES.length;

/** @type {(n1: number, n2: number, opt?: ColRangeOpt) => ColRange} */
const colr = (f, t, opt = {}) => {
    const a = [f, t];
    a.merged = !!opt.merged;
    a.text = opt.text;
    return a;
};

/**
 *
 * @param {number} n
 * @param {string} [text]
 * @returns {ColN}
 */
const col = (n, text) => {
    n = new Number(n);
    n.text = text;
    return n;
};

/** @type {(string | [string, ColOpt | ColOpt[] ])[]} */
export const ROWS = Object.freeze([
    [
        "Hepatitis B",
        {
            0: [
                col(0, '0'),
                col(2, '1'),
                col(3, '2'),
                col(4, '3'),
                // [2, 4]
            ],
            1: [
                1,
                [5, 9],
                [11, -1],
            ],
            2: [col(10, '4')],
        },
    ],
    [
        "Polio",
        {
            0: [
                colr(0, 1, { merged: true, text: '0' }),
                col(2, '1'),
                col(3, '2'),
                col(4, '3'),
                // [2, 4]
            ],
            1: [
                [5, 9],
                [11, -1],
            ],
            2: [col(10, '4')],
        },
    ],
    [
        "BCG",
        {
            0: [col(0, '1')],
            1: [[1, 8]],
        },
    ],
    [
        "DTP",
        {
            0: [
                // [2, 4]
                col(2, '1'),
                col(3, '2'),
                col(4, '3'),
            ],
            1: [[5, 9], [11, 13], 17, 18],
            2: [
                col(10, '4'),
                colr(14, 16, { merged: true, text: '5' }),
                colr(19, -1, { merged: true, text: 'Td/Tdap' })
            ],
        },
    ],
    [
        "Hib",
        {
            0: [
                // [2, 4]
                col(2, '1'),
                col(3, '2'),
                col(4, '3'),
            ],
            1: [
                [5, 9],
                [11, 14],
            ],
            2: [col(10, '4')],
        },
    ],
    [
        "PCV",
        {
            0: [
                // 2, 4, 6
                col(2, '1'),
                col(4, '2'),
                col(6, '3'),
            ],
            1: [3, 5, 7, [10, 14]],
            2: [colr(8, 9, { merged: true, text: '4' })],
            4: [colr(15, -1, { merged: true })],
        },
    ],
    [
        "Rotavirus",
        {
            0: [
                // 2, 4, 6
                col(2, '1 RV1/RV5'),
                col(4, '2 RV1/RV5'),
                col(6, '3 RV5'),
            ],
            1: [3, 5, 7],
        },
    ],
    [
        "Influenza",
        {
            0: [colr(6, -1, { merged: true, text: 'Diulang setiap 1 tahun dosis' })],
        },
    ],
    [
        "MR/MMR",
        {
            0: [col(7, 'MR')],
            1: [8, [11, 13], [17, -1]],
            2: [
                colr(9, 10, { merged: true, text: 'MR/MMR' }),
                colr(14, 16, { merged: true, text: 'MR/MMR' })
            ],
        },
    ],
    ["JE", {
        1: [
            [8, 10],
            [12, -1],
        ],
        3: [
            col(7, '1'),
            col(11, '2'),
        ],
    }],
    [
        "Varisela",
        {
            0: [colr(8, 10, { merged: true, text: '2 Dosis' })],
            1: [[11, -1]],
        },
    ],
    [
        "Hepatitis A",
        {
            0: [colr(8, 11, { merged: true, text: '2 Dosis' })],
            1: [[12, -1]],
        },
    ],
    ["Tifoid", {
        0: [col(11, '1')],
        1: [12, 13],
        2: [colr(14, -1, { merged: true, text: "Diulang setiap 3 tahun 1 dosis" })],
    }],

    ["Dengue", {
        0: [
            colr(15, -1, { merged: true, text: '2 Dosis' })
        ]
    }],
    ["HPV", {
        0: [
            colr(18, 23, { merged: true, text: '2 Dosis' }),
            colr(24, -1, { merged: true, text: '3 Dosis' }),
        ]
    }],
]);
