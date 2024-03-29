// Version: 3.6.7
(function () {
    /*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
    var CryptoJS =
        CryptoJS ||
        (function (h, s) {
            var f = {},
                g = (f.lib = {}),
                q = function () {},
                m = (g.Base = {
                    extend: function (a) {
                        q.prototype = this;
                        var c = new q();
                        a && c.mixIn(a);
                        c.hasOwnProperty("init") ||
                            (c.init = function () {
                                c.$super.init.apply(this, arguments);
                            });
                        c.init.prototype = c;
                        c.$super = this;
                        return c;
                    },
                    create: function () {
                        var a = this.extend();
                        a.init.apply(a, arguments);
                        return a;
                    },
                    init: function () {},
                    mixIn: function (a) {
                        for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                        a.hasOwnProperty("toString") && (this.toString = a.toString);
                    },
                    clone: function () {
                        return this.init.prototype.extend(this);
                    },
                }),
                r = (g.WordArray = m.extend({
                    init: function (a, c) {
                        a = this.words = a || [];
                        this.sigBytes = c != s ? c : 4 * a.length;
                    },
                    toString: function (a) {
                        return (a || k).stringify(this);
                    },
                    concat: function (a) {
                        var c = this.words,
                            d = a.words,
                            b = this.sigBytes;
                        a = a.sigBytes;
                        this.clamp();
                        if (b % 4) for (var e = 0; e < a; e++) c[(b + e) >>> 2] |= ((d[e >>> 2] >>> (24 - 8 * (e % 4))) & 255) << (24 - 8 * ((b + e) % 4));
                        else if (65535 < d.length) for (e = 0; e < a; e += 4) c[(b + e) >>> 2] = d[e >>> 2];
                        else c.push.apply(c, d);
                        this.sigBytes += a;
                        return this;
                    },
                    clamp: function () {
                        var a = this.words,
                            c = this.sigBytes;
                        a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4));
                        a.length = h.ceil(c / 4);
                    },
                    clone: function () {
                        var a = m.clone.call(this);
                        a.words = this.words.slice(0);
                        return a;
                    },
                    random: function (a) {
                        for (var c = [], d = 0; d < a; d += 4) c.push((4294967296 * h.random()) | 0);
                        return new r.init(c, a);
                    },
                })),
                l = (f.enc = {}),
                k = (l.Hex = {
                    stringify: function (a) {
                        var c = a.words;
                        a = a.sigBytes;
                        for (var d = [], b = 0; b < a; b++) {
                            var e = (c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255;
                            d.push((e >>> 4).toString(16));
                            d.push((e & 15).toString(16));
                        }
                        return d.join("");
                    },
                    parse: function (a) {
                        for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << (24 - 4 * (b % 8));
                        return new r.init(d, c / 2);
                    },
                }),
                n = (l.Latin1 = {
                    stringify: function (a) {
                        var c = a.words;
                        a = a.sigBytes;
                        for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode((c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255));
                        return d.join("");
                    },
                    parse: function (a) {
                        for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << (24 - 8 * (b % 4));
                        return new r.init(d, c);
                    },
                }),
                j = (l.Utf8 = {
                    stringify: function (a) {
                        try {
                            return decodeURIComponent(escape(n.stringify(a)));
                        } catch (c) {
                            throw Error("Malformed UTF-8 data");
                        }
                    },
                    parse: function (a) {
                        return n.parse(unescape(encodeURIComponent(a)));
                    },
                }),
                u = (g.BufferedBlockAlgorithm = m.extend({
                    reset: function () {
                        this._data = new r.init();
                        this._nDataBytes = 0;
                    },
                    _append: function (a) {
                        "string" == typeof a && (a = j.parse(a));
                        this._data.concat(a);
                        this._nDataBytes += a.sigBytes;
                    },
                    _process: function (a) {
                        var c = this._data,
                            d = c.words,
                            b = c.sigBytes,
                            e = this.blockSize,
                            f = b / (4 * e),
                            f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                        a = f * e;
                        b = h.min(4 * a, b);
                        if (a) {
                            for (var g = 0; g < a; g += e) this._doProcessBlock(d, g);
                            g = d.splice(0, a);
                            c.sigBytes -= b;
                        }
                        return new r.init(g, b);
                    },
                    clone: function () {
                        var a = m.clone.call(this);
                        a._data = this._data.clone();
                        return a;
                    },
                    _minBufferSize: 0,
                }));
            g.Hasher = u.extend({
                cfg: m.extend(),
                init: function (a) {
                    this.cfg = this.cfg.extend(a);
                    this.reset();
                },
                reset: function () {
                    u.reset.call(this);
                    this._doReset();
                },
                update: function (a) {
                    this._append(a);
                    this._process();
                    return this;
                },
                finalize: function (a) {
                    a && this._append(a);
                    return this._doFinalize();
                },
                blockSize: 16,
                _createHelper: function (a) {
                    return function (c, d) {
                        return new a.init(d).finalize(c);
                    };
                },
                _createHmacHelper: function (a) {
                    return function (c, d) {
                        return new t.HMAC.init(a, d).finalize(c);
                    };
                },
            });
            var t = (f.algo = {});
            return f;
        })(Math);
    (function (h) {
        for (
            var s = CryptoJS,
                f = s.lib,
                g = f.WordArray,
                q = f.Hasher,
                f = s.algo,
                m = [],
                r = [],
                l = function (a) {
                    return (4294967296 * (a - (a | 0))) | 0;
                },
                k = 2,
                n = 0;
            64 > n;

        ) {
            var j;
            a: {
                j = k;
                for (var u = h.sqrt(j), t = 2; t <= u; t++)
                    if (!(j % t)) {
                        j = !1;
                        break a;
                    }
                j = !0;
            }
            j && (8 > n && (m[n] = l(h.pow(k, 0.5))), (r[n] = l(h.pow(k, 1 / 3))), n++);
            k++;
        }
        var a = [],
            f = (f.SHA256 = q.extend({
                _doReset: function () {
                    this._hash = new g.init(m.slice(0));
                },
                _doProcessBlock: function (c, d) {
                    for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
                        if (16 > p) a[p] = c[d + p] | 0;
                        else {
                            var k = a[p - 15],
                                l = a[p - 2];
                            a[p] = (((k << 25) | (k >>> 7)) ^ ((k << 14) | (k >>> 18)) ^ (k >>> 3)) + a[p - 7] + (((l << 15) | (l >>> 17)) ^ ((l << 13) | (l >>> 19)) ^ (l >>> 10)) + a[p - 16];
                        }
                        k = q + (((h << 26) | (h >>> 6)) ^ ((h << 21) | (h >>> 11)) ^ ((h << 7) | (h >>> 25))) + ((h & m) ^ (~h & n)) + r[p] + a[p];
                        l = (((e << 30) | (e >>> 2)) ^ ((e << 19) | (e >>> 13)) ^ ((e << 10) | (e >>> 22))) + ((e & f) ^ (e & g) ^ (f & g));
                        q = n;
                        n = m;
                        m = h;
                        h = (j + k) | 0;
                        j = g;
                        g = f;
                        f = e;
                        e = (k + l) | 0;
                    }
                    b[0] = (b[0] + e) | 0;
                    b[1] = (b[1] + f) | 0;
                    b[2] = (b[2] + g) | 0;
                    b[3] = (b[3] + j) | 0;
                    b[4] = (b[4] + h) | 0;
                    b[5] = (b[5] + m) | 0;
                    b[6] = (b[6] + n) | 0;
                    b[7] = (b[7] + q) | 0;
                },
                _doFinalize: function () {
                    var a = this._data,
                        d = a.words,
                        b = 8 * this._nDataBytes,
                        e = 8 * a.sigBytes;
                    d[e >>> 5] |= 128 << (24 - (e % 32));
                    d[(((e + 64) >>> 9) << 4) + 14] = h.floor(b / 4294967296);
                    d[(((e + 64) >>> 9) << 4) + 15] = b;
                    a.sigBytes = 4 * d.length;
                    this._process();
                    return this._hash;
                },
                clone: function () {
                    var a = q.clone.call(this);
                    a._hash = this._hash.clone();
                    return a;
                },
            }));
        s.SHA256 = q._createHelper(f);
        s.HmacSHA256 = q._createHmacHelper(f);
    })(Math);
    (function () {
        var h = CryptoJS,
            s = h.enc.Utf8;
        h.algo.HMAC = h.lib.Base.extend({
            init: function (f, g) {
                f = this._hasher = new f.init();
                "string" == typeof g && (g = s.parse(g));
                var h = f.blockSize,
                    m = 4 * h;
                g.sigBytes > m && (g = f.finalize(g));
                g.clamp();
                for (var r = (this._oKey = g.clone()), l = (this._iKey = g.clone()), k = r.words, n = l.words, j = 0; j < h; j++) (k[j] ^= 1549556828), (n[j] ^= 909522486);
                r.sigBytes = l.sigBytes = m;
                this.reset();
            },
            reset: function () {
                var f = this._hasher;
                f.reset();
                f.update(this._iKey);
            },
            update: function (f) {
                this._hasher.update(f);
                return this;
            },
            finalize: function (f) {
                var g = this._hasher;
                f = g.finalize(f);
                g.reset();
                return g.finalize(this._oKey.clone().concat(f));
            },
        });
    })();
    /*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
    (function () {
        var h = CryptoJS,
            j = h.lib.WordArray;
        h.enc.Base64 = {
            stringify: function (b) {
                var e = b.words,
                    f = b.sigBytes,
                    c = this._map;
                b.clamp();
                b = [];
                for (var a = 0; a < f; a += 3)
                    for (
                        var d = (((e[a >>> 2] >>> (24 - 8 * (a % 4))) & 255) << 16) | (((e[(a + 1) >>> 2] >>> (24 - 8 * ((a + 1) % 4))) & 255) << 8) | ((e[(a + 2) >>> 2] >>> (24 - 8 * ((a + 2) % 4))) & 255), g = 0;
                        4 > g && a + 0.75 * g < f;
                        g++
                    )
                        b.push(c.charAt((d >>> (6 * (3 - g))) & 63));
                if ((e = c.charAt(64))) for (; b.length % 4; ) b.push(e);
                return b.join("");
            },
            parse: function (b) {
                var e = b.length,
                    f = this._map,
                    c = f.charAt(64);
                c && ((c = b.indexOf(c)), -1 != c && (e = c));
                for (var c = [], a = 0, d = 0; d < e; d++)
                    if (d % 4) {
                        var g = f.indexOf(b.charAt(d - 1)) << (2 * (d % 4)),
                            h = f.indexOf(b.charAt(d)) >>> (6 - 2 * (d % 4));
                        c[a >>> 2] |= (g | h) << (24 - 8 * (a % 4));
                        a++;
                    }
                return j.create(c, a);
            },
            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        };
    })();
    var v = void 0,
        y = !0,
        z = null,
        A = !1;
    function C() {
        return function () {};
    }
    (window.JSON && window.JSON.stringify) ||
        (function () {
            function a() {
                try {
                    return this.valueOf();
                } catch (a) {
                    return z;
                }
            }
            function d(a) {
                c.lastIndex = 0;
                return c.test(a)
                    ? '"' +
                          a.replace(c, function (a) {
                              var b = q[a];
                              return "string" === typeof b ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                          }) +
                          '"'
                    : '"' + a + '"';
            }
            function b(c, q) {
                var t,
                    r,
                    g,
                    j,
                    h,
                    l = f,
                    e = q[c];
                e && "object" === typeof e && (e = a.call(e));
                "function" === typeof m && (e = m.call(q, c, e));
                switch (typeof e) {
                    case "string":
                        return d(e);
                    case "number":
                        return isFinite(e) ? String(e) : "null";
                    case "boolean":
                    case "null":
                        return String(e);
                    case "object":
                        if (!e) return "null";
                        f += p;
                        h = [];
                        if ("[object Array]" === Object.prototype.toString.apply(e)) {
                            j = e.length;
                            for (t = 0; t < j; t += 1) h[t] = b(t, e) || "null";
                            g = 0 === h.length ? "[]" : f ? "[\n" + f + h.join(",\n" + f) + "\n" + l + "]" : "[" + h.join(",") + "]";
                            f = l;
                            return g;
                        }
                        if (m && "object" === typeof m) {
                            j = m.length;
                            for (t = 0; t < j; t += 1) (r = m[t]), "string" === typeof r && (g = b(r, e)) && h.push(d(r) + (f ? ": " : ":") + g);
                        } else for (r in e) Object.hasOwnProperty.call(e, r) && (g = b(r, e)) && h.push(d(r) + (f ? ": " : ":") + g);
                        g = 0 === h.length ? "{}" : f ? "{\n" + f + h.join(",\n" + f) + "\n" + l + "}" : "{" + h.join(",") + "}";
                        f = l;
                        return g;
                }
            }
            window.JSON || (window.JSON = {});
            var c = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                f,
                p,
                q = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" },
                m;
            "function" !== typeof JSON.stringify &&
                (JSON.stringify = function (a, c, d) {
                    var q;
                    p = f = "";
                    if ("number" === typeof d) for (q = 0; q < d; q += 1) p += " ";
                    else "string" === typeof d && (p = d);
                    if ((m = c) && "function" !== typeof c && ("object" !== typeof c || "number" !== typeof c.length)) throw Error("JSON.stringify");
                    return b("", { "": a });
                });
            "function" !== typeof JSON.parse &&
                (JSON.parse = function (a) {
                    return eval("(" + a + ")");
                });
        })();
    var ca = 1,
        fa = A,
        ga = [],
        ha = "-pnpres",
        D = 1e3,
        ia = "/",
        ja = "&",
        ka = /{([\w\-]+)}/g;
    function la() {
        return "x" + ++ca + "" + +new Date();
    }
    function G() {
        return +new Date();
    }
    var ma,
        na = Math.floor(20 * Math.random());
    ma = function (a, d) {
        return (0 < a.indexOf("pubsub.") && a.replace("pubsub", "ps" + (d ? pa().split("-")[0] : 20 > ++na ? na : (na = 1)))) || a;
    };
    function qa(a, d) {
        var b = a.join(ia),
            c = [];
        if (!d) return b;
        N(d, function (a, b) {
            var d = "object" == typeof b ? JSON.stringify(b) : b;
            "undefined" != typeof b && b != z && 0 < encodeURIComponent(d).length && c.push(a + "=" + encodeURIComponent(d));
        });
        return (b += "?" + c.join(ja));
    }
    function ra(a, d) {
        function b() {
            f + d > G() ? (clearTimeout(c), (c = setTimeout(b, d))) : ((f = G()), a());
        }
        var c,
            f = 0;
        return b;
    }
    function sa(a, d) {
        var b = [];
        N(a || [], function (a) {
            d(a) && b.push(a);
        });
        return b;
    }
    function ta(a, d) {
        return a.replace(ka, function (a, c) {
            return d[c] || a;
        });
    }
    function pa(a) {
        var d = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
            var c = (16 * Math.random()) | 0;
            return ("x" == a ? c : (c & 3) | 8).toString(16);
        });
        a && a(d);
        return d;
    }
    function N(a, d) {
        if (a && d)
            if (a && ((Array.isArray && Array.isArray(a)) || "number" === typeof a.length)) for (var b = 0, c = a.length; b < c; ) d.call(a[b], a[b], b++);
            else for (b in a) a.hasOwnProperty && a.hasOwnProperty(b) && d.call(a[b], b, a[b]);
    }
    function ua(a, d) {
        var b = [];
        N(a || [], function (a, f) {
            b.push(d(a, f));
        });
        return b;
    }
    function va(a, d) {
        var b = [];
        N(a, function (a, f) {
            d ? 0 > a.search("-pnpres") && f.f && b.push(a) : f.f && b.push(a);
        });
        return b.sort();
    }
    function wa() {
        setTimeout(function () {
            fa ||
                ((fa = 1),
                N(ga, function (a) {
                    a();
                }));
        }, D);
    }
    var O,
        T = 14,
        U = 8,
        xa = A;
    function ya(a, d) {
        var b = "",
            c,
            f;
        if (d) {
            c = a[15];
            if (16 < c) throw "Decryption error: Maybe bad key";
            if (16 == c) return "";
            for (f = 0; f < 16 - c; f++) b += String.fromCharCode(a[f]);
        } else for (f = 0; 16 > f; f++) b += String.fromCharCode(a[f]);
        return b;
    }
    function za(a, d) {
        var b = [],
            c;
        if (!d)
            try {
                a = unescape(encodeURIComponent(a));
            } catch (f) {
                throw "Error on UTF-8 encode";
            }
        for (c = 0; c < a.length; c++) b[c] = a.charCodeAt(c);
        return b;
    }
    function Aa(a, d) {
        var b = 12 <= T ? 3 : 2,
            c = [],
            f = [],
            c = [],
            f = [],
            p = a.concat(d),
            q;
        c[0] = GibberishAES.l.m(p);
        f = c[0];
        for (q = 1; q < b; q++) (c[q] = GibberishAES.l.m(c[q - 1].concat(p))), (f = f.concat(c[q]));
        c = f.slice(0, 4 * U);
        f = f.slice(4 * U, 4 * U + 16);
        return { key: c, i: f };
    }
    function Ba(a, d, b) {
        var d = Ca(d),
            c = Math.ceil(a.length / 16),
            f = [],
            p,
            q = [];
        for (p = 0; p < c; p++) {
            var m = f,
                u = p,
                x = a.slice(16 * p, 16 * p + 16),
                t = [],
                r = v,
                r = v;
            16 > x.length && ((r = 16 - x.length), (t = [r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r]));
            for (r = 0; r < x.length; r++) t[r] = x[r];
            m[u] = t;
        }
        0 === a.length % 16 && f.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
        for (p = 0; p < f.length; p++) (f[p] = 0 === p ? Da(f[p], b) : Da(f[p], q[p - 1])), (q[p] = Ea(f[p], d));
        return q;
    }
    function Fa(a, d, b, c) {
        var d = Ca(d),
            f = a.length / 16,
            p = [],
            q,
            m = [],
            u = "";
        for (q = 0; q < f; q++) p.push(a.slice(16 * q, 16 * (q + 1)));
        for (q = p.length - 1; 0 <= q; q--) (m[q] = Ga(p[q], d)), (m[q] = 0 === q ? Da(m[q], b) : Da(m[q], p[q - 1]));
        for (q = 0; q < f - 1; q++) u += ya(m[q]);
        var u = u + ya(m[q], y),
            x;
        if (c) x = u;
        else
            try {
                x = decodeURIComponent(escape(u));
            } catch (t) {
                throw "Bad Key";
            }
        return x;
    }
    function Ea(a, d) {
        xa = A;
        var b = La(a, d, 0),
            c;
        for (c = 1; c < T + 1; c++) (b = Ma(b)), (b = Na(b)), c < T && (b = Oa(b)), (b = La(b, d, c));
        return b;
    }
    function Ga(a, d) {
        xa = y;
        var b = La(a, d, T),
            c;
        for (c = T - 1; -1 < c; c--) (b = Na(b)), (b = Ma(b)), (b = La(b, d, c)), 0 < c && (b = Oa(b));
        return b;
    }
    function Ma(a) {
        var d = xa ? Pa : Qa,
            b = [],
            c;
        for (c = 0; 16 > c; c++) b[c] = d[a[c]];
        return b;
    }
    function Na(a) {
        var d = [],
            b = xa ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11],
            c;
        for (c = 0; 16 > c; c++) d[c] = a[b[c]];
        return d;
    }
    function Oa(a) {
        var d = [],
            b;
        if (xa)
            for (b = 0; 4 > b; b++)
                (d[4 * b] = Ta[a[4 * b]] ^ Ua[a[1 + 4 * b]] ^ Za[a[2 + 4 * b]] ^ $a[a[3 + 4 * b]]),
                    (d[1 + 4 * b] = $a[a[4 * b]] ^ Ta[a[1 + 4 * b]] ^ Ua[a[2 + 4 * b]] ^ Za[a[3 + 4 * b]]),
                    (d[2 + 4 * b] = Za[a[4 * b]] ^ $a[a[1 + 4 * b]] ^ Ta[a[2 + 4 * b]] ^ Ua[a[3 + 4 * b]]),
                    (d[3 + 4 * b] = Ua[a[4 * b]] ^ Za[a[1 + 4 * b]] ^ $a[a[2 + 4 * b]] ^ Ta[a[3 + 4 * b]]);
        else
            for (b = 0; 4 > b; b++)
                (d[4 * b] = ab[a[4 * b]] ^ bb[a[1 + 4 * b]] ^ a[2 + 4 * b] ^ a[3 + 4 * b]),
                    (d[1 + 4 * b] = a[4 * b] ^ ab[a[1 + 4 * b]] ^ bb[a[2 + 4 * b]] ^ a[3 + 4 * b]),
                    (d[2 + 4 * b] = a[4 * b] ^ a[1 + 4 * b] ^ ab[a[2 + 4 * b]] ^ bb[a[3 + 4 * b]]),
                    (d[3 + 4 * b] = bb[a[4 * b]] ^ a[1 + 4 * b] ^ a[2 + 4 * b] ^ ab[a[3 + 4 * b]]);
        return d;
    }
    function La(a, d, b) {
        var c = [],
            f;
        for (f = 0; 16 > f; f++) c[f] = a[f] ^ d[b][f];
        return c;
    }
    function Da(a, d) {
        var b = [],
            c;
        for (c = 0; 16 > c; c++) b[c] = a[c] ^ d[c];
        return b;
    }
    function Ca(a) {
        var d = [],
            b = [],
            c,
            f,
            p = [];
        for (c = 0; c < U; c++) (f = [a[4 * c], a[4 * c + 1], a[4 * c + 2], a[4 * c + 3]]), (d[c] = f);
        for (c = U; c < 4 * (T + 1); c++) {
            d[c] = [];
            for (a = 0; 4 > a; a++) b[a] = d[c - 1][a];
            if (0 === c % U) {
                a = b[0];
                f = v;
                for (f = 0; 4 > f; f++) b[f] = b[f + 1];
                b[3] = a;
                b = cb(b);
                b[0] ^= db[c / U - 1];
            } else 6 < U && 4 == c % U && (b = cb(b));
            for (a = 0; 4 > a; a++) d[c][a] = d[c - U][a] ^ b[a];
        }
        for (c = 0; c < T + 1; c++) {
            p[c] = [];
            for (b = 0; 4 > b; b++) p[c].push(d[4 * c + b][0], d[4 * c + b][1], d[4 * c + b][2], d[4 * c + b][3]);
        }
        return p;
    }
    function cb(a) {
        for (var d = 0; 4 > d; d++) a[d] = Qa[a[d]];
        return a;
    }
    function eb(a, d) {
        var b = [];
        for (i = 0; i < a.length; i += d) b[i / d] = parseInt(a.substr(i, d), 16);
        return b;
    }
    function fb(a) {
        for (var d = [], b = 0; 256 > b; b++) {
            for (var c = a, f = b, p = v, q = v, p = (q = 0); 8 > p; p++) (q = 1 == (f & 1) ? q ^ c : q), (c = 127 < c ? 283 ^ (c << 1) : c << 1), (f >>>= 1);
            d[b] = q;
        }
        return d;
    }
    var Qa = eb(
            "637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16",
            2
        ),
        Pa,
        gb = Qa,
        hb = [];
    for (i = 0; i < gb.length; i++) hb[gb[i]] = i;
    Pa = hb;
    var db = eb("01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591", 2),
        ab = fb(2),
        bb = fb(3),
        $a = fb(9),
        Ua = fb(11),
        Za = fb(13),
        Ta = fb(14),
        ib,
        jb = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        kb = jb.split("");
    "function" === typeof Array.indexOf && (jb = kb);
    ib = {
        encode: function (a) {
            var d = [],
                b = "",
                c;
            for (c = 0; c < 16 * a.length; c++) d.push(a[Math.floor(c / 16)][c % 16]);
            for (c = 0; c < d.length; c += 3)
                (b += kb[d[c] >> 2]), (b += kb[((d[c] & 3) << 4) | (d[c + 1] >> 4)]), (b = d[c + 1] !== v ? b + kb[((d[c + 1] & 15) << 2) | (d[c + 2] >> 6)] : b + "="), (b = d[c + 2] !== v ? b + kb[d[c + 2] & 63] : b + "=");
            a = b.slice(0, 64);
            for (c = 1; c < Math.ceil(b.length / 64); c++) a += b.slice(64 * c, 64 * c + 64) + (Math.ceil(b.length / 64) == c + 1 ? "" : "\n");
            return a;
        },
        decode: function (a) {
            var a = a.replace(/\n/g, ""),
                d = [],
                b = [],
                c = [],
                f;
            for (f = 0; f < a.length; f += 4)
                (b[0] = jb.indexOf(a.charAt(f))),
                    (b[1] = jb.indexOf(a.charAt(f + 1))),
                    (b[2] = jb.indexOf(a.charAt(f + 2))),
                    (b[3] = jb.indexOf(a.charAt(f + 3))),
                    (c[0] = (b[0] << 2) | (b[1] >> 4)),
                    (c[1] = ((b[1] & 15) << 4) | (b[2] >> 2)),
                    (c[2] = ((b[2] & 3) << 6) | b[3]),
                    d.push(c[0], c[1], c[2]);
            return (d = d.slice(0, d.length - (d.length % 16)));
        },
    };
    O = {
        size: function (a) {
            switch (a) {
                case 128:
                    T = 10;
                    U = 4;
                    break;
                case 192:
                    T = 12;
                    U = 6;
                    break;
                case 256:
                    T = 14;
                    U = 8;
                    break;
                default:
                    throw "Invalid Key Size Specified:" + a;
            }
        },
        h2a: function (a) {
            var d = [];
            a.replace(/(..)/g, function (a) {
                d.push(parseInt(a, 16));
            });
            return d;
        },
        expandKey: Ca,
        encryptBlock: Ea,
        decryptBlock: Ga,
        Decrypt: xa,
        s2a: za,
        rawEncrypt: Ba,
        rawDecrypt: Fa,
        dec: function (a, d, b) {
            var a = ib.q(a),
                c = a.slice(8, 16),
                c = Aa(za(d, b), c),
                d = c.key,
                c = c.i,
                a = a.slice(16, a.length);
            return (a = Fa(a, d, c, b));
        },
        openSSLKey: Aa,
        a2h: function (a) {
            var d = "",
                b;
            for (b = 0; b < a.length; b++) d += (16 > a[b] ? "0" : "") + a[b].toString(16);
            return d;
        },
        enc: function (a, d, b) {
            var c;
            c = [];
            var f;
            for (f = 0; 8 > f; f++) c = c.concat(Math.floor(256 * Math.random()));
            f = Aa(za(d, b), c);
            d = f.key;
            f = f.i;
            c = [[83, 97, 108, 116, 101, 100, 95, 95].concat(c)];
            a = za(a, b);
            a = Ba(a, d, f);
            a = c.concat(a);
            return ib.s(a);
        },
        Hash: {
            MD5: function (a) {
                function d(a, b) {
                    var c, d, f, e, g;
                    f = a & 2147483648;
                    e = b & 2147483648;
                    c = a & 1073741824;
                    d = b & 1073741824;
                    g = (a & 1073741823) + (b & 1073741823);
                    return c & d ? g ^ 2147483648 ^ f ^ e : c | d ? (g & 1073741824 ? g ^ 3221225472 ^ f ^ e : g ^ 1073741824 ^ f ^ e) : g ^ f ^ e;
                }
                function b(a, b, c, f, e, g, l) {
                    a = d(a, d(d((b & c) | (~b & f), e), l));
                    return d((a << g) | (a >>> (32 - g)), b);
                }
                function c(a, b, c, f, e, g, l) {
                    a = d(a, d(d((b & f) | (c & ~f), e), l));
                    return d((a << g) | (a >>> (32 - g)), b);
                }
                function f(a, b, c, f, e, g, l) {
                    a = d(a, d(d(b ^ c ^ f, e), l));
                    return d((a << g) | (a >>> (32 - g)), b);
                }
                function p(a, b, c, f, g, e, l) {
                    a = d(a, d(d(c ^ (b | ~f), g), l));
                    return d((a << e) | (a >>> (32 - e)), b);
                }
                function q(a) {
                    var b,
                        c,
                        d = [];
                    for (c = 0; 3 >= c; c++) (b = (a >>> (8 * c)) & 255), (d = d.concat(b));
                    return d;
                }
                var m = [],
                    u,
                    x,
                    t,
                    r,
                    g,
                    j,
                    h,
                    l,
                    e = eb(
                        "67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391",
                        8
                    ),
                    m = a.length;
                u = m + 8;
                x = 16 * ((u - (u % 64)) / 64 + 1);
                t = [];
                for (g = r = 0; g < m; ) (u = (g - (g % 4)) / 4), (r = 8 * (g % 4)), (t[u] |= a[g] << r), g++;
                u = (g - (g % 4)) / 4;
                t[u] |= 128 << (8 * (g % 4));
                t[x - 2] = m << 3;
                t[x - 1] = m >>> 29;
                m = t;
                g = e[0];
                j = e[1];
                h = e[2];
                l = e[3];
                for (a = 0; a < m.length; a += 16)
                    (u = g),
                        (x = j),
                        (t = h),
                        (r = l),
                        (g = b(g, j, h, l, m[a + 0], 7, e[4])),
                        (l = b(l, g, j, h, m[a + 1], 12, e[5])),
                        (h = b(h, l, g, j, m[a + 2], 17, e[6])),
                        (j = b(j, h, l, g, m[a + 3], 22, e[7])),
                        (g = b(g, j, h, l, m[a + 4], 7, e[8])),
                        (l = b(l, g, j, h, m[a + 5], 12, e[9])),
                        (h = b(h, l, g, j, m[a + 6], 17, e[10])),
                        (j = b(j, h, l, g, m[a + 7], 22, e[11])),
                        (g = b(g, j, h, l, m[a + 8], 7, e[12])),
                        (l = b(l, g, j, h, m[a + 9], 12, e[13])),
                        (h = b(h, l, g, j, m[a + 10], 17, e[14])),
                        (j = b(j, h, l, g, m[a + 11], 22, e[15])),
                        (g = b(g, j, h, l, m[a + 12], 7, e[16])),
                        (l = b(l, g, j, h, m[a + 13], 12, e[17])),
                        (h = b(h, l, g, j, m[a + 14], 17, e[18])),
                        (j = b(j, h, l, g, m[a + 15], 22, e[19])),
                        (g = c(g, j, h, l, m[a + 1], 5, e[20])),
                        (l = c(l, g, j, h, m[a + 6], 9, e[21])),
                        (h = c(h, l, g, j, m[a + 11], 14, e[22])),
                        (j = c(j, h, l, g, m[a + 0], 20, e[23])),
                        (g = c(g, j, h, l, m[a + 5], 5, e[24])),
                        (l = c(l, g, j, h, m[a + 10], 9, e[25])),
                        (h = c(h, l, g, j, m[a + 15], 14, e[26])),
                        (j = c(j, h, l, g, m[a + 4], 20, e[27])),
                        (g = c(g, j, h, l, m[a + 9], 5, e[28])),
                        (l = c(l, g, j, h, m[a + 14], 9, e[29])),
                        (h = c(h, l, g, j, m[a + 3], 14, e[30])),
                        (j = c(j, h, l, g, m[a + 8], 20, e[31])),
                        (g = c(g, j, h, l, m[a + 13], 5, e[32])),
                        (l = c(l, g, j, h, m[a + 2], 9, e[33])),
                        (h = c(h, l, g, j, m[a + 7], 14, e[34])),
                        (j = c(j, h, l, g, m[a + 12], 20, e[35])),
                        (g = f(g, j, h, l, m[a + 5], 4, e[36])),
                        (l = f(l, g, j, h, m[a + 8], 11, e[37])),
                        (h = f(h, l, g, j, m[a + 11], 16, e[38])),
                        (j = f(j, h, l, g, m[a + 14], 23, e[39])),
                        (g = f(g, j, h, l, m[a + 1], 4, e[40])),
                        (l = f(l, g, j, h, m[a + 4], 11, e[41])),
                        (h = f(h, l, g, j, m[a + 7], 16, e[42])),
                        (j = f(j, h, l, g, m[a + 10], 23, e[43])),
                        (g = f(g, j, h, l, m[a + 13], 4, e[44])),
                        (l = f(l, g, j, h, m[a + 0], 11, e[45])),
                        (h = f(h, l, g, j, m[a + 3], 16, e[46])),
                        (j = f(j, h, l, g, m[a + 6], 23, e[47])),
                        (g = f(g, j, h, l, m[a + 9], 4, e[48])),
                        (l = f(l, g, j, h, m[a + 12], 11, e[49])),
                        (h = f(h, l, g, j, m[a + 15], 16, e[50])),
                        (j = f(j, h, l, g, m[a + 2], 23, e[51])),
                        (g = p(g, j, h, l, m[a + 0], 6, e[52])),
                        (l = p(l, g, j, h, m[a + 7], 10, e[53])),
                        (h = p(h, l, g, j, m[a + 14], 15, e[54])),
                        (j = p(j, h, l, g, m[a + 5], 21, e[55])),
                        (g = p(g, j, h, l, m[a + 12], 6, e[56])),
                        (l = p(l, g, j, h, m[a + 3], 10, e[57])),
                        (h = p(h, l, g, j, m[a + 10], 15, e[58])),
                        (j = p(j, h, l, g, m[a + 1], 21, e[59])),
                        (g = p(g, j, h, l, m[a + 8], 6, e[60])),
                        (l = p(l, g, j, h, m[a + 15], 10, e[61])),
                        (h = p(h, l, g, j, m[a + 6], 15, e[62])),
                        (j = p(j, h, l, g, m[a + 13], 21, e[63])),
                        (g = p(g, j, h, l, m[a + 4], 6, e[64])),
                        (l = p(l, g, j, h, m[a + 11], 10, e[65])),
                        (h = p(h, l, g, j, m[a + 2], 15, e[66])),
                        (j = p(j, h, l, g, m[a + 9], 21, e[67])),
                        (g = d(g, u)),
                        (j = d(j, x)),
                        (h = d(h, t)),
                        (l = d(l, r));
                return q(g).concat(q(j), q(h), q(l));
            },
        },
        Base64: ib,
    };
    if (!window.PUBNUB) {
        var lb = function (a, d) {
                return CryptoJS.HmacSHA256(a, d).toString(CryptoJS.enc.Base64);
            },
            mb = function (a) {
                return document.getElementById(a);
            },
            nb = function (a) {
                console.error(a);
            },
            pb = function (a, d) {
                var b = [];
                N(a.split(/\s+/), function (a) {
                    N((d || document).getElementsByTagName(a), function (a) {
                        b.push(a);
                    });
                });
                return b;
            },
            qb = function (a, d, b) {
                N(a.split(","), function (a) {
                    function f(a) {
                        a || (a = window.event);
                        b(a) || ((a.cancelBubble = y), a.preventDefault && a.preventDefault(), a.stopPropagation && a.stopPropagation());
                    }
                    d.addEventListener ? d.addEventListener(a, f, A) : d.attachEvent ? d.attachEvent("on" + a, f) : (d["on" + a] = f);
                });
            },
            rb = function () {
                return pb("head")[0];
            },
            V = function (a, d, b) {
                if (b) a.setAttribute(d, b);
                else return a && a.getAttribute && a.getAttribute(d);
            },
            sb = function (a, d) {
                for (var b in d)
                    if (d.hasOwnProperty(b))
                        try {
                            a.style[b] = d[b] + (0 < "|width|height|top|left|".indexOf(b) && "number" == typeof d[b] ? "px" : "");
                        } catch (c) {}
            },
            tb = function (a) {
                return document.createElement(a);
            },
            zb = function () {
                return ub || $() ? 0 : la();
            },
            Ab = function (a) {
                function d(a, b) {
                    H ||
                        ((H = 1),
                        (e.onerror = z),
                        clearTimeout(Ra),
                        a || !b || Sa(b),
                        setTimeout(function () {
                            a && S();
                            var b = mb(aa),
                                c = b && b.parentNode;
                            c && c.removeChild(b);
                        }, D));
                }
                if (ub || $()) {
                    a: {
                        var b,
                            c,
                            f = function () {
                                if (!q) {
                                    q = 1;
                                    clearTimeout(u);
                                    try {
                                        c = JSON.parse(b.responseText);
                                    } catch (a) {
                                        return j(1);
                                    }
                                    p = 1;
                                    r(c);
                                }
                            },
                            p = 0,
                            q = 0,
                            m = a.timeout || 1e4,
                            u = setTimeout(function () {
                                j(1, { message: "timeout" });
                            }, m),
                            x = a.b || C(),
                            t = a.data || {},
                            r = a.c || C(),
                            g = !a.h,
                            j = function (a, c) {
                                p || ((p = 1), clearTimeout(u), b && ((b.onerror = b.onload = z), b.abort && b.abort(), (b = z)), a && x(c));
                            };
                        try {
                            b = $() || (window.XDomainRequest && new XDomainRequest()) || new XMLHttpRequest();
                            b.onerror = b.onabort = function () {
                                j(1, b.responseText || { error: "Network Connection Error" });
                            };
                            b.onload = b.onloadend = f;
                            b.onreadystatechange = function () {
                                if (b && 4 == b.readyState)
                                    switch (b.status) {
                                        case 401:
                                        case 402:
                                        case 403:
                                            try {
                                                (c = JSON.parse(b.responseText)), j(1, c);
                                            } catch (a) {
                                                return j(1, b.responseText);
                                            }
                                    }
                            };
                            var h = qa(a.url, t);
                            b.open("GET", h, g);
                            g && (b.timeout = m);
                            b.send();
                        } catch (l) {
                            j(0);
                            ub = 0;
                            a = Ab(a);
                            break a;
                        }
                        a = j;
                    }
                    return a;
                }
                var e = tb("script"),
                    f = a.a,
                    aa = la(),
                    H = 0,
                    Ra = setTimeout(function () {
                        d(1, { message: "timeout" });
                    }, a.timeout || 1e4),
                    S = a.b || C(),
                    m = a.data || {},
                    Sa = a.c || C();
                window[f] = function (a) {
                    d(0, a);
                };
                a.h || (e[Bb] = Bb);
                e.onerror = function () {
                    d(1);
                };
                e.src = qa(a.url, m);
                V(e, "id", aa);
                rb().appendChild(e);
                return d;
            },
            Cb = function () {
                return !("onLine" in navigator) ? 1 : navigator.onLine;
            },
            $ = function () {
                if (!Db || !Db.get) return 0;
                var a = {
                    id: $.id++,
                    send: C(),
                    abort: function () {
                        a.id = {};
                    },
                    open: function (d, b) {
                        $[a.id] = a;
                        Db.get(a.id, b);
                    },
                };
                return a;
            },
            Bb = "async",
            ub = -1 == navigator.userAgent.indexOf("MSIE 6");
        window.console || (window.console = window.console || {});
        console.log || (console.log = console.error = (window.opera || {}).postError || C());
        var Eb,
            Fb = window.localStorage;
        Eb = {
            get: function (a) {
                try {
                    return Fb ? Fb.getItem(a) : -1 == document.cookie.indexOf(a) ? z : ((document.cookie || "").match(RegExp(a + "=([^;]+)")) || [])[1] || z;
                } catch (d) {}
            },
            set: function (a, d) {
                try {
                    if (Fb) return Fb.setItem(a, d) && 0;
                    document.cookie = a + "=" + d + "; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/";
                } catch (b) {}
            },
        };
        var Gb = {
                list: {},
                unbind: function (a) {
                    Gb.list[a] = [];
                },
                bind: function (a, d) {
                    (Gb.list[a] = Gb.list[a] || []).push(d);
                },
                fire: function (a, d) {
                    N(Gb.list[a] || [], function (a) {
                        a(d);
                    });
                },
            },
            Ib = mb("pubnub") || 0,
            Jb = function (a) {
                function d() {}
                function b(a, b) {
                    function c(b) {
                        b && ((Va = G() - (b / 1e4 + (G() - d) / 2)), a && a(Va));
                    }
                    var d = G();
                    (b && c(b)) || I.time(c);
                }
                function c(a, b) {
                    Ha && Ha(a, b);
                    Ha = z;
                }
                function f() {
                    I.time(function (a) {
                        b(C(), a);
                        a || c(1, { error: "Heartbeat failed to connect to Pubnub Servers.Please check your network settings." });
                        setTimeout(f, ob);
                    });
                }
                function p() {
                    Nb() || c(1, { error: "Offline. Please check your network settings. " });
                    setTimeout(p, D);
                }
                function q(a, b) {
                    "object" == typeof a && a.error && a.message && a.payload ? b({ message: a.message, payload: a.payload }) : b(a);
                }
                function m(a, b, c) {
                    if ("object" == typeof a) {
                        if (a.error && a.message && a.payload) {
                            c({ message: a.message, payload: a.payload });
                            return;
                        }
                        if (a.payload) {
                            b(a.payload);
                            return;
                        }
                    }
                    b(a);
                }
                function u(a) {
                    var b = 0;
                    N(va(B), function (c) {
                        if ((c = B[c])) b++, (a || C())(c);
                    });
                    return b;
                }
                function x(a) {
                    if (Ob) {
                        if (!Q.length) return;
                    } else {
                        a && (Q.j = 0);
                        if (Q.j || !Q.length) return;
                        Q.j = 1;
                    }
                    E(Q.shift());
                }
                function t() {
                    !Wa && r();
                }
                function r() {
                    clearTimeout(W);
                    !J || 500 <= J || 1 > J || !va(B, y).length
                        ? (Wa = A)
                        : ((Wa = y),
                          I.presence_heartbeat({
                              callback: function () {
                                  W = setTimeout(r, J * D);
                              },
                              error: function (a) {
                                  s && s("Presence Heartbeat unable to reach Pubnub servers." + JSON.stringify(a));
                                  W = setTimeout(r, J * D);
                              },
                          }));
                }
                function g(a, b) {
                    return ba.decrypt(a, b || X) || ba.decrypt(a, X) || a;
                }
                function j(a, b, c) {
                    var d = A;
                    if ("number" === typeof a) d = 5 < a || 0 == a ? A : y;
                    else {
                        if ("boolean" === typeof a) return a ? 30 : 0;
                        d = y;
                    }
                    return d ? (c && c("Presence Heartbeat value invalid. Valid range ( x > 5 or x = 0). Current Value : " + (b || 5)), b || 5) : a;
                }
                function h(a) {
                    var b = "",
                        c = [];
                    N(a, function (a) {
                        c.push(a);
                    });
                    var d = c.sort(),
                        f;
                    for (f in d) {
                        var e = d[f],
                            b = b + (e + "=" + encodeURIComponent(a[e]));
                        f != d.length - 1 && (b += "&");
                    }
                    return b;
                }
                function l(a) {
                    a || (a = {});
                    N(Y, function (b, c) {
                        b in a || (a[b] = c);
                    });
                    return a;
                }
                function e(a) {
                    return Jb(a);
                }
                function aa(a) {
                    function b(a, c) {
                        var d = (a & 65535) + (c & 65535);
                        return (((a >> 16) + (c >> 16) + (d >> 16)) << 16) | (d & 65535);
                    }
                    function c(a, b) {
                        return (a >>> b) | (a << (32 - b));
                    }
                    var d;
                    d = a.replace(/\r\n/g, "\n");
                    for (var a = "", f = 0; f < d.length; f++) {
                        var e = d.charCodeAt(f);
                        128 > e
                            ? (a += String.fromCharCode(e))
                            : (127 < e && 2048 > e ? (a += String.fromCharCode((e >> 6) | 192)) : ((a += String.fromCharCode((e >> 12) | 224)), (a += String.fromCharCode(((e >> 6) & 63) | 128))), (a += String.fromCharCode((e & 63) | 128)));
                    }
                    f = a;
                    d = [];
                    for (e = 0; e < 8 * f.length; e += 8) d[e >> 5] |= (f.charCodeAt(e / 8) & 255) << (24 - (e % 32));
                    var g = 8 * a.length,
                        f = [
                            1116352408,
                            1899447441,
                            3049323471,
                            3921009573,
                            961987163,
                            1508970993,
                            2453635748,
                            2870763221,
                            3624381080,
                            310598401,
                            607225278,
                            1426881987,
                            1925078388,
                            2162078206,
                            2614888103,
                            3248222580,
                            3835390401,
                            4022224774,
                            264347078,
                            604807628,
                            770255983,
                            1249150122,
                            1555081692,
                            1996064986,
                            2554220882,
                            2821834349,
                            2952996808,
                            3210313671,
                            3336571891,
                            3584528711,
                            113926993,
                            338241895,
                            666307205,
                            773529912,
                            1294757372,
                            1396182291,
                            1695183700,
                            1986661051,
                            2177026350,
                            2456956037,
                            2730485921,
                            2820302411,
                            3259730800,
                            3345764771,
                            3516065817,
                            3600352804,
                            4094571909,
                            275423344,
                            430227734,
                            506948616,
                            659060556,
                            883997877,
                            958139571,
                            1322822218,
                            1537002063,
                            1747873779,
                            1955562222,
                            2024104815,
                            2227730452,
                            2361852424,
                            2428436474,
                            2756734187,
                            3204031479,
                            3329325298,
                        ],
                        a = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225],
                        e = Array(64),
                        l,
                        m,
                        j,
                        h,
                        q,
                        p,
                        r,
                        t,
                        s,
                        w,
                        u;
                    d[g >> 5] |= 128 << (24 - (g % 32));
                    d[(((g + 64) >> 9) << 4) + 15] = g;
                    for (t = 0; t < d.length; t += 16) {
                        g = a[0];
                        l = a[1];
                        m = a[2];
                        j = a[3];
                        h = a[4];
                        q = a[5];
                        p = a[6];
                        r = a[7];
                        for (s = 0; 64 > s; s++)
                            (e[s] = 16 > s ? d[s + t] : b(b(b(c(e[s - 2], 17) ^ c(e[s - 2], 19) ^ (e[s - 2] >>> 10), e[s - 7]), c(e[s - 15], 7) ^ c(e[s - 15], 18) ^ (e[s - 15] >>> 3)), e[s - 16])),
                                (w = b(b(b(b(r, c(h, 6) ^ c(h, 11) ^ c(h, 25)), (h & q) ^ (~h & p)), f[s]), e[s])),
                                (u = b(c(g, 2) ^ c(g, 13) ^ c(g, 22), (g & l) ^ (g & m) ^ (l & m))),
                                (r = p),
                                (p = q),
                                (q = h),
                                (h = b(j, w)),
                                (j = m),
                                (m = l),
                                (l = g),
                                (g = b(w, u));
                        a[0] = b(g, a[0]);
                        a[1] = b(l, a[1]);
                        a[2] = b(m, a[2]);
                        a[3] = b(j, a[3]);
                        a[4] = b(h, a[4]);
                        a[5] = b(q, a[5]);
                        a[6] = b(p, a[6]);
                        a[7] = b(r, a[7]);
                    }
                    d = "";
                    for (f = 0; f < 4 * a.length; f++) d += "0123456789abcdef".charAt((a[f >> 2] >> (8 * (3 - (f % 4)) + 4)) & 15) + "0123456789abcdef".charAt((a[f >> 2] >> (8 * (3 - (f % 4)))) & 15);
                    return d;
                }
                a.jsonp && (ub = 0);
                var H = a.subscribe_key || "";
                a.uuid || Eb.get(H + "uuid");
                var Ra = a.leave_on_unload || 0;
                a.xdr = Ab;
                a.db = Eb;
                a.error = a.error || nb;
                a._is_online = Cb;
                a.jsonp_cb = zb;
                a.hmac_SHA256 = lb;
                O.size(256);
                var S = O.s2a("0123456789012345");
                a.crypto_obj = {
                    encrypt: function (a, b) {
                        if (!b) return a;
                        var c = O.s2a(aa(b).slice(0, 32)),
                            d = O.s2a(JSON.stringify(a)),
                            c = O.rawEncrypt(d, c, S);
                        return O.Base64.encode(c) || a;
                    },
                    decrypt: function (a, b) {
                        if (!b) return a;
                        var c = O.s2a(aa(b).slice(0, 32));
                        try {
                            var d = O.Base64.decode(a),
                                e = O.rawDecrypt(d, c, S, A);
                            return JSON.parse(e);
                        } catch (f) {}
                    },
                };
                a.params = { pnsdk: "PubNub-JS-Web/3.6.7" };
                var Sa = +a.windowing || 10,
                    Hb = (+a.timeout || 310) * D,
                    ob = (+a.keepalive || 60) * D,
                    Lb = a.noleave || 0,
                    P = a.publish_key || "demo",
                    w = a.subscribe_key || "demo",
                    M = a.auth_key || "",
                    Ia = a.secret_key || "",
                    vb = a.hmac_SHA256,
                    Xa = a.ssl ? "s" : "",
                    oa = "http" + Xa + "://" + (a.origin || "pubsub.pubnub.com"),
                    K = ma(oa),
                    wb = ma(oa),
                    Q = [],
                    Va = 0,
                    xb = 0,
                    yb = 0,
                    Ha = 0,
                    Ja = a.restore || 0,
                    da = 0,
                    Ya = A,
                    B = {},
                    Z = {},
                    W = z,
                    R = j(a.heartbeat || a.pnexpires || 0, a.error),
                    J = a.heartbeat_interval || R - 3,
                    Wa = A,
                    Ob = a.no_wait_for_pending,
                    Pb = a["compatible_3.5"] || A,
                    E = a.xdr,
                    Y = a.params || {},
                    s = a.error || C(),
                    Nb =
                        a._is_online ||
                        function () {
                            return 1;
                        },
                    L =
                        a.jsonp_cb ||
                        function () {
                            return 0;
                        },
                    ea = a.db || { get: C(), set: C() },
                    X = a.cipher_key,
                    F = a.uuid || (ea && ea.get(w + "uuid")) || "",
                    ba = a.crypto_obj || {
                        encrypt: function (a) {
                            return a;
                        },
                        decrypt: function (a) {
                            return a;
                        },
                    },
                    I = {
                        LEAVE: function (a, b, c, d) {
                            var e = { uuid: F, auth: M },
                                f = ma(oa),
                                c = c || C(),
                                g = d || C(),
                                d = L();
                            if (0 < a.indexOf(ha)) return y;
                            if ((Pb && (!Xa || "0" == d)) || Lb) return A;
                            "0" != d && (e.callback = d);
                            E({
                                h: b || Xa,
                                timeout: 2e3,
                                a: d,
                                data: l(e),
                                c: function (a) {
                                    m(a, c, g);
                                },
                                b: function (a) {
                                    q(a, g);
                                },
                                url: [f, "v2", "presence", "sub_key", w, "channel", encodeURIComponent(a), "leave"],
                            });
                            return y;
                        },
                        set_resumed: function (a) {
                            Ya = a;
                        },
                        get_cipher_key: function () {
                            return X;
                        },
                        set_cipher_key: function (a) {
                            X = a;
                        },
                        raw_encrypt: function (a, b) {
                            return ba.encrypt(a, b || X) || a;
                        },
                        raw_decrypt: function (a, b) {
                            return g(a, b);
                        },
                        get_heartbeat: function () {
                            return R;
                        },
                        set_heartbeat: function (a) {
                            R = j(a, J, s);
                            J = 1 <= R - 3 ? R - 3 : 1;
                            d();
                            r();
                        },
                        get_heartbeat_interval: function () {
                            return J;
                        },
                        set_heartbeat_interval: function (a) {
                            J = a;
                            r();
                        },
                        get_version: function () {
                            return "3.6.7";
                        },
                        getGcmMessageObject: function (a) {
                            return { data: a };
                        },
                        getApnsMessageObject: function (a) {
                            var b = { aps: { badge: 1, alert: "" } };
                            for (k in a) k[b] = a[k];
                            return b;
                        },
                        newPnMessage: function () {
                            var a = {};
                            gcm && (a.pn_gcm = gcm);
                            apns && (a.pn_apns = apns);
                            for (k in n) a[k] = n[k];
                            return a;
                        },
                        _add_param: function (a, b) {
                            Y[a] = b;
                        },
                        history: function (a, b) {
                            var b = a.callback || b,
                                c = a.count || a.limit || 100,
                                d = a.reverse || "false",
                                e = a.error || C(),
                                f = a.auth_key || M,
                                h = a.cipher_key,
                                m = a.channel,
                                j = a.start,
                                p = a.end,
                                r = a.include_token,
                                t = {},
                                u = L();
                            if (!m) return s("Missing Channel");
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            t.stringtoken = "true";
                            t.count = c;
                            t.reverse = d;
                            t.auth = f;
                            u && (t.callback = u);
                            j && (t.start = j);
                            p && (t.end = p);
                            r && (t.include_token = "true");
                            E({
                                a: u,
                                data: l(t),
                                c: function (a) {
                                    if ("object" == typeof a && a.error) e({ message: a.message, payload: a.payload });
                                    else {
                                        for (var c = a[0], d = [], f = 0; f < c.length; f++) {
                                            var l = g(c[f], h);
                                            try {
                                                d.push(JSON.parse(l));
                                            } catch (m) {
                                                d.push(l);
                                            }
                                        }
                                        b([d, a[1], a[2]]);
                                    }
                                },
                                b: function (a) {
                                    q(a, e);
                                },
                                url: [K, "v2", "history", "sub-key", w, "channel", encodeURIComponent(m)],
                            });
                        },
                        replay: function (a, b) {
                            var b = b || a.callback || C(),
                                c = a.auth_key || M,
                                d = a.source,
                                e = a.destination,
                                f = a.stop,
                                g = a.start,
                                h = a.end,
                                j = a.reverse,
                                q = a.limit,
                                p = L(),
                                r = {};
                            if (!d) return s("Missing Source Channel");
                            if (!e) return s("Missing Destination Channel");
                            if (!P) return s("Missing Publish Key");
                            if (!w) return s("Missing Subscribe Key");
                            "0" != p && (r.callback = p);
                            f && (r.stop = "all");
                            j && (r.reverse = "true");
                            g && (r.start = g);
                            h && (r.end = h);
                            q && (r.count = q);
                            r.auth = c;
                            E({
                                a: p,
                                c: function (a) {
                                    m(a, b, err);
                                },
                                b: function () {
                                    b([0, "Disconnected"]);
                                },
                                url: [K, "v1", "replay", P, w, d, e],
                                data: l(r),
                            });
                        },
                        auth: function (a) {
                            M = a;
                            d();
                        },
                        time: function (a) {
                            var b = L();
                            E({
                                a: b,
                                data: l({ uuid: F, auth: M }),
                                timeout: 5 * D,
                                url: [K, "time", b],
                                c: function (b) {
                                    a(b[0]);
                                },
                                b: function () {
                                    a(0);
                                },
                            });
                        },
                        publish: function (a, b) {
                            var c = a.message;
                            if (!c) return s("Missing Message");
                            var b = b || a.callback || c.callback || C(),
                                d = a.channel || c.channel,
                                e = a.auth_key || M,
                                f = a.cipher_key,
                                g = a.error || c.error || C(),
                                h = a.post || A,
                                j = "store_in_history" in a ? a.store_in_history : y,
                                p = L(),
                                r = "push";
                            a.prepend && (r = "unshift");
                            if (!d) return s("Missing Channel");
                            if (!P) return s("Missing Publish Key");
                            if (!w) return s("Missing Subscribe Key");
                            c.getPubnubMessage && (c = c.getPubnubMessage());
                            c = JSON.stringify(ba.encrypt(c, f || X) || c);
                            c = [K, "publish", P, w, 0, encodeURIComponent(d), p, encodeURIComponent(c)];
                            Y = { uuid: F, auth: e };
                            j || (Y.store = "0");
                            Q[r]({
                                a: p,
                                timeout: 5 * D,
                                url: c,
                                data: l(Y),
                                b: function (a) {
                                    q(a, g);
                                    x(1);
                                },
                                c: function (a) {
                                    m(a, b, g);
                                    x(1);
                                },
                                mode: h ? "POST" : "GET",
                            });
                            x();
                        },
                        unsubscribe: function (a, b) {
                            var c = a.channel,
                                b = b || a.callback || C(),
                                e = a.error || C();
                            da = 0;
                            c = ua((c.join ? c.join(",") : "" + c).split(","), function (a) {
                                if (B[a]) return a + "," + a + ha;
                            }).join(",");
                            N(c.split(","), function (a) {
                                var c = y;
                                a && (fa && (c = I.LEAVE(a, 0, b, e)), c || b({ action: "leave" }), (B[a] = 0), a in Z && delete Z[a]);
                            });
                            d();
                        },
                        subscribe: function (a, b) {
                            function e(a) {
                                a
                                    ? setTimeout(d, D)
                                    : ((K = ma(oa, 1)),
                                      (wb = ma(oa, 1)),
                                      setTimeout(function () {
                                          I.time(e);
                                      }, D));
                                u(function (b) {
                                    if (a && b.d) return (b.d = 0), b.p(b.name);
                                    !a && !b.d && ((b.d = 1), b.o(b.name));
                                });
                            }
                            function f() {
                                var a = L(),
                                    b = va(B).join(",");
                                if (b) {
                                    c();
                                    var h = l({ uuid: F, auth: m });
                                    2 < JSON.stringify(Z).length && (h.state = JSON.stringify(Z));
                                    R && (h.heartbeat = R);
                                    t();
                                    Ha = E({
                                        timeout: aa,
                                        a: a,
                                        b: function (a) {
                                            q(a, x);
                                            I.time(e);
                                        },
                                        data: l(h),
                                        url: [wb, "subscribe", w, encodeURIComponent(b), a, da],
                                        c: function (a) {
                                            if (!a || ("object" == typeof a && "error" in a && a.error)) return x(a.error), setTimeout(d, D);
                                            J(a[1]);
                                            da = (!da && Ja && ea.get(w)) || a[1];
                                            u(function (a) {
                                                a.g || ((a.g = 1), a.n(a.name));
                                            });
                                            if (Ya && !Ja) (da = 0), (Ya = A), ea.set(w, 0);
                                            else {
                                                Q && ((da = 1e4), (Q = 0));
                                                ea.set(w, a[1]);
                                                var b,
                                                    c = (2 < a.length
                                                        ? a[2]
                                                        : ua(va(B), function (b) {
                                                              return ua(Array(a[0].length).join(",").split(","), function () {
                                                                  return b;
                                                              });
                                                          }).join(",")
                                                    ).split(",");
                                                b = function () {
                                                    var a = c.shift() || yb;
                                                    return [(B[a] || {}).a || xb, a.split(ha)[0]];
                                                };
                                                var e = G() - Va - +a[1] / 1e4;
                                                N(a[0], function (c) {
                                                    var d = b(),
                                                        c = g(c, B[d[1]] ? B[d[1]].cipher_key : z);
                                                    d[0](c, a, d[1], e);
                                                });
                                            }
                                            setTimeout(f, Y);
                                        },
                                    });
                                }
                            }
                            var h = a.channel,
                                b = (b = b || a.callback) || a.message,
                                m = a.auth_key || M,
                                j = a.connect || C(),
                                p = a.reconnect || C(),
                                r = a.disconnect || C(),
                                x = a.error || C(),
                                J = a.idle || C(),
                                H = a.presence || 0,
                                P = a.noheresync || 0,
                                Q = a.backfill || 0,
                                X = a.timetoken || 0,
                                aa = a.timeout || Hb,
                                Y = a.windowing || Sa,
                                S = a.state,
                                W = a.heartbeat || a.pnexpires,
                                ba = a.restore || Ja;
                            Ja = ba;
                            da = X;
                            if (!h) return s("Missing Channel");
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            (W || 0 === W) && I.set_heartbeat(W);
                            N((h.join ? h.join(",") : "" + h).split(","), function (c) {
                                var d = B[c] || {};
                                B[(yb = c)] = { name: c, g: d.g, d: d.d, f: 1, a: (xb = b), cipher_key: a.cipher_key, n: j, o: r, p: p };
                                S && (Z[c] = c in S ? S[c] : S);
                                H &&
                                    (I.subscribe({ channel: c + ha, callback: H, restore: ba }),
                                    !d.f &&
                                        !P &&
                                        I.here_now({
                                            channel: c,
                                            callback: function (a) {
                                                N("uuids" in a ? a.uuids : [], function (b) {
                                                    H({ action: "join", uuid: b, timestamp: Math.floor(G() / 1e3), occupancy: a.occupancy || 1 }, a, c);
                                                });
                                            },
                                        }));
                            });
                            d = function () {
                                c();
                                setTimeout(f, Y);
                            };
                            if (!fa) return ga.push(d);
                            d();
                        },
                        here_now: function (a, b) {
                            var b = a.callback || b,
                                c = a.error || C(),
                                d = a.auth_key || M,
                                e = a.channel,
                                f = L(),
                                g = a.state,
                                d = { uuid: F, auth: d };
                            if (!("uuids" in a ? a.uuids : 1)) d.disable_uuids = 1;
                            g && (d.state = 1);
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            g = [K, "v2", "presence", "sub_key", w];
                            e && g.push("channel") && g.push(encodeURIComponent(e));
                            "0" != f && (d.callback = f);
                            E({
                                a: f,
                                data: l(d),
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                                url: g,
                            });
                        },
                        where_now: function (a, b) {
                            var b = a.callback || b,
                                c = a.error || C(),
                                d = a.auth_key || M,
                                e = L(),
                                f = a.uuid || F,
                                d = { auth: d };
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            "0" != e && (d.callback = e);
                            E({
                                a: e,
                                data: l(d),
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                                url: [K, "v2", "presence", "sub_key", w, "uuid", encodeURIComponent(f)],
                            });
                        },
                        state: function (a, b) {
                            var b = a.callback || b || C(),
                                c = a.error || C(),
                                d = a.auth_key || M,
                                e = L(),
                                f = a.state,
                                g = a.uuid || F,
                                h = a.channel,
                                d = l({ auth: d });
                            if (!w) return s("Missing Subscribe Key");
                            if (!g) return s("Missing UUID");
                            if (!h) return s("Missing Channel");
                            "0" != e && (d.callback = e);
                            B[h] && B[h].f && f && (Z[h] = f);
                            d.state = JSON.stringify(f);
                            f = f ? [K, "v2", "presence", "sub-key", w, "channel", encodeURIComponent(h), "uuid", g, "data"] : [K, "v2", "presence", "sub-key", w, "channel", encodeURIComponent(h), "uuid", encodeURIComponent(g)];
                            E({
                                a: e,
                                data: l(d),
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                                url: f,
                            });
                        },
                        grant: function (a, b) {
                            var b = a.callback || b,
                                c = a.error || C(),
                                d = a.channel,
                                e = L(),
                                f = a.ttl,
                                g = a.read ? "1" : "0",
                                j = a.write ? "1" : "0",
                                p = a.auth_key;
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            if (!P) return s("Missing Publish Key");
                            if (!Ia) return s("Missing Secret Key");
                            var r = w + "\n" + P + "\ngrant\n",
                                g = { w: j, r: g, timestamp: Math.floor(new Date().getTime() / 1e3) };
                            "undefined" != d && d != z && 0 < d.length && (g.channel = d);
                            "0" != e && (g.callback = e);
                            if (f || 0 === f) g.ttl = f;
                            p && (g.auth = p);
                            g = l(g);
                            p || delete g.auth;
                            r += h(g);
                            d = vb(r, Ia);
                            d = d.replace(/\+/g, "-");
                            d = d.replace(/\//g, "_");
                            g.signature = d;
                            E({
                                a: e,
                                data: g,
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                                url: [K, "v1", "auth", "grant", "sub-key", w],
                            });
                        },
                        audit: function (a, b) {
                            var b = a.callback || b,
                                c = a.error || C(),
                                d = a.channel,
                                e = a.auth_key,
                                f = L();
                            if (!b) return s("Missing Callback");
                            if (!w) return s("Missing Subscribe Key");
                            if (!P) return s("Missing Publish Key");
                            if (!Ia) return s("Missing Secret Key");
                            var g = w + "\n" + P + "\naudit\n",
                                j = { timestamp: Math.floor(new Date().getTime() / 1e3) };
                            "0" != f && (j.callback = f);
                            "undefined" != d && d != z && 0 < d.length && (j.channel = d);
                            e && (j.auth = e);
                            j = l(j);
                            e || delete j.auth;
                            g += h(j);
                            d = vb(g, Ia);
                            d = d.replace(/\+/g, "-");
                            d = d.replace(/\//g, "_");
                            j.signature = d;
                            E({
                                a: f,
                                data: j,
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                                url: [K, "v1", "auth", "audit", "sub-key", w],
                            });
                        },
                        revoke: function (a, b) {
                            a.read = A;
                            a.write = A;
                            I.grant(a, b);
                        },
                        set_uuid: function (a) {
                            F = a;
                            d();
                        },
                        get_uuid: function () {
                            return F;
                        },
                        presence_heartbeat: function (a) {
                            var b = a.callback || C(),
                                c = a.error || C(),
                                a = L(),
                                d = { uuid: F, auth: M };
                            2 < JSON.stringify(Z).length && (d.state = JSON.stringify(Z));
                            0 < R && 320 > R && (d.heartbeat = R);
                            "0" != a && (d.callback = a);
                            var e = E,
                                d = l(d),
                                f = 5 * D,
                                g = K,
                                h = w,
                                j = va(B, y).join(",");
                            e({
                                a: a,
                                data: d,
                                timeout: f,
                                url: [g, "v2", "presence", "sub-key", h, "channel", encodeURIComponent(j), "heartbeat"],
                                c: function (a) {
                                    m(a, b, c);
                                },
                                b: function (a) {
                                    q(a, c);
                                },
                            });
                        },
                        xdr: E,
                        ready: wa,
                        db: ea,
                        uuid: pa,
                        map: ua,
                        each: N,
                        "each-channel": u,
                        grep: sa,
                        offline: function () {
                            c(1, { message: "Offline. Please check your network settings." });
                        },
                        supplant: ta,
                        now: G,
                        unique: la,
                        updater: ra,
                    };
                F || (F = I.uuid());
                ea.set(w + "uuid", F);
                setTimeout(p, D);
                setTimeout(f, ob);
                W = setTimeout(t, (J - 3) * D);
                b();
                var H = I,
                    Ka;
                for (Ka in H) H.hasOwnProperty(Ka) && (e[Ka] = H[Ka]);
                e.css = sb;
                e.$ = mb;
                e.create = tb;
                e.bind = qb;
                e.head = rb;
                e.search = pb;
                e.attr = V;
                e.events = Gb;
                e.init = e;
                e.secure = e;
                qb("beforeunload", window, function () {
                    if (Ra)
                        e["each-channel"](function (a) {
                            e.LEAVE(a.name, 0);
                        });
                    return y;
                });
                if (a.notest) return e;
                qb("offline", window, e.offline);
                qb("offline", document, e.offline);
                return e;
            };
        Jb.init = Jb;
        Jb.secure = Jb;
        "complete" === document.readyState
            ? setTimeout(wa, 0)
            : qb("load", window, function () {
                  setTimeout(wa, 0);
              });
        var Kb = Ib || {};
        PUBNUB = Jb({ notest: 1, publish_key: V(Kb, "pub-key"), subscribe_key: V(Kb, "sub-key"), ssl: !document.location.href.indexOf("https") || "on" == V(Kb, "ssl"), origin: V(Kb, "origin"), uuid: V(Kb, "uuid") });
        window.jQuery && (window.jQuery.PUBNUB = Jb);
        "undefined" !== typeof module && (module.exports = PUBNUB) && wa();
        var Db = mb("pubnubs") || 0;
        if (Ib) {
            sb(Ib, { position: "absolute", top: -D });
            if ("opera" in window || V(Ib, "flash"))
                Ib.innerHTML = "<object id=pubnubs data=https://pubnub.a.ssl.fastly.net/pubnub.swf><param name=movie value=https://pubnub.a.ssl.fastly.net/pubnub.swf><param name=allowscriptaccess value=always></object>";
            PUBNUB.rdx = function (a, d) {
                if (!d) return $[a].onerror();
                $[a].responseText = unescape(d);
                $[a].onload();
            };
            $.id = D;
        }
    }
    var Mb = (PUBNUB.ws = function (a, d) {
        if (!(this instanceof Mb)) return new Mb(a, d);
        var b = this,
            a = (b.url = a || "");
        b.protocol = d || "Sec-WebSocket-Protocol";
        var c = a.split("/"),
            c = { ssl: "wss:" === c[0], origin: c[2], publish_key: c[3], subscribe_key: c[4], channel: c[5] };
        b.CONNECTING = 0;
        b.OPEN = 1;
        b.CLOSING = 2;
        b.CLOSED = 3;
        b.CLOSE_NORMAL = 1e3;
        b.CLOSE_GOING_AWAY = 1001;
        b.CLOSE_PROTOCOL_ERROR = 1002;
        b.CLOSE_UNSUPPORTED = 1003;
        b.CLOSE_TOO_LARGE = 1004;
        b.CLOSE_NO_STATUS = 1005;
        b.CLOSE_ABNORMAL = 1006;
        b.onclose = b.onerror = b.onmessage = b.onopen = b.onsend = C();
        b.binaryType = "";
        b.extensions = "";
        b.bufferedAmount = 0;
        b.trasnmitting = A;
        b.buffer = [];
        b.readyState = b.CONNECTING;
        if (!a) return (b.readyState = b.CLOSED), b.onclose({ code: b.CLOSE_ABNORMAL, reason: "Missing URL", wasClean: y }), b;
        b.e = PUBNUB.init(c);
        b.e.k = c;
        b.k = c;
        b.e.subscribe({
            restore: A,
            channel: c.channel,
            disconnect: b.onerror,
            reconnect: b.onopen,
            error: function () {
                b.onclose({ code: b.CLOSE_ABNORMAL, reason: "Missing URL", wasClean: A });
            },
            callback: function (a) {
                b.onmessage({ data: a });
            },
            connect: function () {
                b.readyState = b.OPEN;
                b.onopen();
            },
        });
    });
    Mb.prototype.send = function (a) {
        var d = this;
        d.e.publish({
            channel: d.e.k.channel,
            message: a,
            callback: function (a) {
                d.onsend({ data: a });
            },
        });
    };
})();
