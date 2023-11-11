"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
var rxjs_1 = require("rxjs");
var firestore_1 = require("@angular/fire/firestore");
var CollectionService = /** @class */ (function () {
    function CollectionService(path, firestore, converter) {
        this.path = path;
        this.converter = converter !== null && converter !== void 0 ? converter : {
            fromFirestore: function (snap) {
                return __assign({ id: snap.id }, snap.data());
            },
            toFirestore: function (_a) {
                var id = _a.id, rest = __rest(_a, ["id"]);
                return rest;
            }
        };
        this.firestore = firestore;
    }
    CollectionService.prototype.getDoc = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                docRef = (0, firestore_1.doc)(this.firestore, this.path, id).withConverter(this.converter);
                return [2 /*return*/, (0, firestore_1.getDocFromCache)(docRef).catch(function (error) { return (0, firestore_1.getDoc)(docRef); }).then(function (doc) { return doc.data(); })];
            });
        });
    };
    CollectionService.prototype.getDocSnapshots = function (id) {
        var docRef = (0, firestore_1.doc)(this.firestore, this.path, id).withConverter(this.converter);
        return (0, firestore_1.docSnapshots)(docRef).pipe((0, rxjs_1.map)(function (doc) { return doc.data(); }));
    };
    CollectionService.prototype.getByFields = function (fields, order) {
        return __awaiter(this, void 0, void 0, function () {
            var colRef, contraints, queryData;
            return __generator(this, function (_a) {
                colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
                contraints = fields.map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return (0, firestore_1.where)(key, "==", value);
                });
                order ? contraints.push((0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : null;
                queryData = firestore_1.query.apply(void 0, __spreadArray([colRef], contraints, false));
                return [2 /*return*/, (0, firestore_1.getDocsFromCache)(queryData).then(function (docs) { return docs.empty ? (0, firestore_1.getDocs)(queryData) : docs; }).then(function (docs) { return docs.docs.map(function (doc) { return doc.data(); }); })];
            });
        });
    };
    CollectionService.prototype.getByFieldSnapshots = function (fields, order) {
        var colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
        var contraints = fields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (0, firestore_1.where)(key, "==", value);
        });
        order ? contraints.push((0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : null;
        var queryData = firestore_1.query.apply(void 0, __spreadArray([colRef], contraints, false));
        return (0, firestore_1.collectionSnapshots)(queryData).pipe((0, rxjs_1.map)(function (docs) { return docs.map(function (doc) { return doc.data(); }); }));
    };
    CollectionService.prototype.getByFieldContains = function (fields, order) {
        return __awaiter(this, void 0, void 0, function () {
            var colRef, contraints, queryData;
            return __generator(this, function (_a) {
                colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
                contraints = fields.map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return (0, firestore_1.where)(key, "array-contains", value);
                });
                order ? contraints.push((0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : null;
                queryData = firestore_1.query.apply(void 0, __spreadArray([colRef], contraints, false));
                return [2 /*return*/, (0, firestore_1.getDocsFromCache)(queryData).then(function (docs) { return docs.empty ? (0, firestore_1.getDocs)(queryData) : docs; }).then(function (docs) { return docs.docs.map(function (doc) { return doc.data(); }); })];
            });
        });
    };
    CollectionService.prototype.getByFieldContainsSnapshots = function (fields, order) {
        var colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
        var contraints = fields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (0, firestore_1.where)(key, "array-contains", value);
        });
        order ? contraints.push((0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : null;
        var queryData = firestore_1.query.apply(void 0, __spreadArray([colRef], contraints, false));
        return (0, firestore_1.collectionSnapshots)(queryData).pipe((0, rxjs_1.map)(function (docs) { return docs.map(function (doc) { return doc.data(); }); }));
    };
    CollectionService.prototype.list = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var colRef, queryData;
            return __generator(this, function (_a) {
                colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
                queryData = order ? (0, firestore_1.query)(colRef, (0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : colRef;
                return [2 /*return*/, (0, firestore_1.getDocsFromCache)(queryData).then(function (docs) { return docs.empty ? (0, firestore_1.getDocs)(queryData) : docs; }).then(function (docs) { return docs.docs.map(function (doc) { return doc.data(); }); })];
            });
        });
    };
    CollectionService.prototype.listSnapshots = function (order) {
        var colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
        var queryData = order ? (0, firestore_1.query)(colRef, (0, firestore_1.orderBy)(order.fieldPath, order.directionStr)) : colRef;
        return (0, firestore_1.collectionSnapshots)(queryData).pipe((0, rxjs_1.map)(function (docs) { return docs.map(function (doc) { return doc.data(); }); }));
    };
    CollectionService.prototype.add = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                docRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
                return [2 /*return*/, (0, firestore_1.addDoc)(docRef, data).then(function (ref) { return ref.id; })];
            });
        });
    };
    CollectionService.prototype.edit = function (id, newDocData) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                docRef = (0, firestore_1.doc)(this.firestore, this.path, id).withConverter(this.converter);
                return [2 /*return*/, (0, firestore_1.updateDoc)(docRef, newDocData)];
            });
        });
    };
    CollectionService.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                docRef = (0, firestore_1.doc)(this.firestore, this.path, id);
                return [2 /*return*/, (0, firestore_1.deleteDoc)(docRef)];
            });
        });
    };
    CollectionService.prototype.set = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                docRef = (0, firestore_1.doc)(this.firestore, this.path, id);
                return [2 /*return*/, (0, firestore_1.setDoc)(docRef, data)];
            });
        });
    };
    CollectionService.prototype.page = function (_a) {
        var field = _a.field, start = _a.start, perPage = _a.perPage, filter = _a.filter, end = _a.end, customFilters = _a.customFilters;
        var compositeFilter = [];
        var queryConstraints = [(0, firestore_1.orderBy)(field), (0, firestore_1.limit)(perPage !== null && perPage !== void 0 ? perPage : 10)];
        if (filter) {
            compositeFilter.push((0, firestore_1.where)(field, '>=', filter), (0, firestore_1.where)(field, "<=", filter + "\uf8ff"));
        }
        if (start) {
            queryConstraints.push((0, firestore_1.startAfter)(start));
        }
        if (end) {
            queryConstraints.push((0, firestore_1.endBefore)(end));
        }
        compositeFilter.push.apply(compositeFilter, customFilters !== null && customFilters !== void 0 ? customFilters : []);
        console.log(compositeFilter);
        return this.querySnapshots.apply(this, __spreadArray([firestore_1.and.apply(void 0, compositeFilter)], queryConstraints, false));
    };
    CollectionService.prototype.query = function (compositeFilter) {
        var queryConstraints = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            queryConstraints[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var colRef, queryData;
            return __generator(this, function (_a) {
                colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
                queryData = firestore_1.query.apply(void 0, __spreadArray([colRef, compositeFilter], queryConstraints, false));
                return [2 /*return*/, (0, firestore_1.getDocsFromCache)(queryData).then(function (docs) { return docs.empty ? (0, firestore_1.getDocs)(queryData) : docs; }).then(function (docs) { return docs.docs.map(function (doc) { return doc.data(); }); })];
            });
        });
    };
    CollectionService.prototype.querySnapshots = function (compositeFilter) {
        var queryConstraints = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            queryConstraints[_i - 1] = arguments[_i];
        }
        var colRef = (0, firestore_1.collection)(this.firestore, this.path).withConverter(this.converter);
        var queryData = firestore_1.query.apply(void 0, __spreadArray([colRef, compositeFilter], queryConstraints, false));
        return (0, firestore_1.collectionSnapshots)(queryData).pipe((0, rxjs_1.map)(function (docs) { return docs.map(function (doc) { return doc.data(); }); }));
    };
    CollectionService.prototype.changeFieldOfMultipleDocs = function (field, docs, value) {
        return __awaiter(this, void 0, void 0, function () {
            var batch, _i, docs_1, document_1, docRef;
            var _a;
            return __generator(this, function (_b) {
                batch = (0, firestore_1.writeBatch)(this.firestore);
                for (_i = 0, docs_1 = docs; _i < docs_1.length; _i++) {
                    document_1 = docs_1[_i];
                    docRef = (0, firestore_1.doc)(this.firestore, this.path, document_1);
                    batch.update(docRef, (_a = {}, _a[field] = value, _a));
                }
                return [2 /*return*/, batch.commit()];
            });
        });
    };
    CollectionService.prototype.subcollection = function (id, name, converter) {
        return new CollectionService("".concat(this.path, "/").concat(id, "/").concat(name), this.firestore, converter);
    };
    return CollectionService;
}());
exports.CollectionService = CollectionService;
