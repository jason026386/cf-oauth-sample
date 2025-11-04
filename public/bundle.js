/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/main.ts":
/*!*********************!*\
  !*** ./app/main.ts ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _webtaku_el__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @webtaku/el */ \"./node_modules/@webtaku/el/lib/index.js\");\n\nconst urlParams = new URLSearchParams(window.location.search);\nlet sid = urlParams.get('session');\nif (sid)\n    localStorage.setItem('sid', sid);\nelse\n    sid = localStorage.getItem('sid');\nlet meData;\nif (sid) {\n    const res = await fetch('/api/oauth2/me', {\n        headers: {\n            'Authorization': `Bearer ${sid}`,\n            'Content-Type': 'application/json',\n        }\n    });\n    const data = await res.json();\n    if (data.ok)\n        meData = data;\n}\ndocument.body.append((0,_webtaku_el__WEBPACK_IMPORTED_MODULE_0__.el)('h1', 'Hello World'), ...(meData ? [\n    (0,_webtaku_el__WEBPACK_IMPORTED_MODULE_0__.el)('p', `Hello ${meData.user?.name}`),\n    (0,_webtaku_el__WEBPACK_IMPORTED_MODULE_0__.el)('button', 'Logout', {\n        onclick: async () => {\n            await fetch('/api/oauth2/logout', {\n                headers: {\n                    'Authorization': `Bearer ${sid}`,\n                    'Content-Type': 'application/json',\n                }\n            });\n            localStorage.removeItem('sid');\n            meData = undefined;\n            window.location.reload();\n        }\n    }),\n] : [(0,_webtaku_el__WEBPACK_IMPORTED_MODULE_0__.el)('button', 'Login with Google', {\n        onclick: () => {\n            window.location.href = '/api/oauth2/start/google';\n        }\n    }), (0,_webtaku_el__WEBPACK_IMPORTED_MODULE_0__.el)('button', 'Login with Apple', {\n        onclick: () => {\n            window.location.href = '/api/oauth2/start/apple';\n        }\n    })]));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack://cf-oauth-sample/./app/main.ts?\n}");

/***/ }),

/***/ "./node_modules/@webtaku/el/lib/index.js":
/*!***********************************************!*\
  !*** ./node_modules/@webtaku/el/lib/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   el: () => (/* binding */ el)\n/* harmony export */ });\nconst toCamel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());\nfunction el(selector = '', ...args) {\n    const parts = selector.split(/([#.])/);\n    const tag = parts[0] || 'div';\n    const el = document.createElement(tag);\n    // id/class from selector\n    for (let i = 1; i < parts.length; i += 2) {\n        const type = parts[i];\n        const value = parts[i + 1];\n        if (!value)\n            continue;\n        if (type === '#')\n            el.id = value;\n        else if (type === '.') {\n            for (const cn of value.split(/\\s+/))\n                if (cn)\n                    el.classList.add(cn);\n        }\n    }\n    const fragment = document.createDocumentFragment();\n    for (const arg of args) {\n        if (arg instanceof HTMLElement) {\n            fragment.appendChild(arg);\n            continue;\n        }\n        if (typeof arg === 'string') {\n            const lines = arg.split('\\n');\n            for (let i = 0; i < lines.length; i++) {\n                if (i > 0)\n                    fragment.appendChild(document.createElement('br'));\n                const line = lines[i];\n                if (line)\n                    fragment.appendChild(document.createTextNode(line));\n            }\n            continue;\n        }\n        if (!arg)\n            continue;\n        const attrs = arg;\n        for (const key in attrs) {\n            if (!Object.prototype.hasOwnProperty.call(attrs, key))\n                continue;\n            const value = attrs[key];\n            if (value == null)\n                continue;\n            // style: object or string\n            if (key === 'style') {\n                if (typeof value === 'string') {\n                    const css = value.trim();\n                    if (css) {\n                        // add a semicolon if needed when appending\n                        const hasExisting = el.style.cssText.trim().length > 0;\n                        if (hasExisting && !css.startsWith(';')) {\n                            el.style.cssText += ';';\n                        }\n                        el.style.cssText += css;\n                    }\n                }\n                else if (typeof value === 'object') {\n                    Object.assign(el.style, value);\n                }\n                continue;\n            }\n            // dataset object\n            if (key === 'dataset' && typeof value === 'object') {\n                for (const dk in value) {\n                    const dv = value[dk];\n                    if (dv == null)\n                        continue;\n                    el.dataset[toCamel(dk)] = String(dv);\n                }\n                continue;\n            }\n            if (key === 'id') {\n                el.id = value;\n                continue;\n            }\n            // class / className\n            if (key === 'class' || key === 'className') {\n                const classNames = String(value).split(/\\s+/);\n                for (const cn of classNames)\n                    if (cn)\n                        el.classList.add(cn);\n                continue;\n            }\n            // direct data-* mapping (attribute + dataset)\n            if (key.startsWith('data-')) {\n                const dsKey = toCamel(key.slice(5));\n                el.dataset[dsKey] = String(value);\n                el.setAttribute(key, String(value));\n                continue;\n            }\n            // aria-* attributes\n            if (key.startsWith('aria-')) {\n                el.setAttribute(key, String(value));\n                continue;\n            }\n            // If the property exists on the element, set it directly\n            if (key in el) {\n                el[key] = value;\n                continue;\n            }\n            // Fallback: set as an attribute\n            el.setAttribute(key, String(value));\n        }\n    }\n    el.appendChild(fragment);\n    return el;\n}\n\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack://cf-oauth-sample/./node_modules/@webtaku/el/lib/index.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var hasSymbol = typeof Symbol === "function";
/******/ 		var webpackQueues = hasSymbol ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = hasSymbol ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = hasSymbol ? Symbol("webpack error") : "__webpack_error__";
/******/ 		
/******/ 		
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 		
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 		
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			var handle = (deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 		
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}
/******/ 			var done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 			body(handle, done);
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./app/main.ts");
/******/ 	
/******/ })()
;