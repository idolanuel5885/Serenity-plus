(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  18566,
  (e, r, a) => {
    r.exports = e.r(76562);
  },
  66606,
  (e) => {
    'use strict';
    e.s(['default', () => s]);
    var r = e.i(43476),
      a = e.i(71645),
      t = e.i(18566);
    function s() {
      let e = (0, t.useRouter)(),
        [s, l] = (0, a.useState)({
          weeklyTarget: 3,
          primaryWindow: '06:00–09:00',
          timezone: 'GMT+2',
          usualSitLength: 30,
          whyPractice: '',
          supportNeeds: '',
        }),
        o = async (r) => {
          r.preventDefault();
          try {
            let r = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'user@example.com', name: 'User', ...s }),
              }),
              a = await r.json();
            a.success
              ? (localStorage.setItem('userId', a.user.id), e.push('/'))
              : (console.error('Failed to save onboarding data:', a.error),
                alert('Failed to save your meditation plan. Please try again.'));
          } catch (e) {
            (console.error('Error saving onboarding data:', e),
              alert('Failed to save your meditation plan. Please try again.'));
          }
        };
      return (0, r.jsx)('div', {
        className: 'min-h-screen bg-white p-6',
        children: (0, r.jsxs)('div', {
          className: 'max-w-md mx-auto',
          children: [
            (0, r.jsx)('h1', {
              className: 'text-2xl font-bold text-center mb-8',
              children: 'Your Plan',
            }),
            (0, r.jsxs)('form', {
              onSubmit: o,
              className: 'space-y-6',
              children: [
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'Weekly Target',
                    }),
                    (0, r.jsx)('select', {
                      value: s.weeklyTarget,
                      onChange: (e) => l({ ...s, weeklyTarget: parseInt(e.target.value) }),
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      children: [1, 2, 3, 4, 5, 6, 7].map((e) =>
                        (0, r.jsxs)('option', { value: e, children: [e, ' times'] }, e),
                      ),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'Primary Practice Window',
                    }),
                    (0, r.jsx)('select', {
                      value: s.primaryWindow,
                      onChange: (e) => l({ ...s, primaryWindow: e.target.value }),
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      children: [
                        '05:00–08:00',
                        '06:00–09:00',
                        '07:00–10:00',
                        '18:00–21:00',
                        '19:00–22:00',
                        '20:00–23:00',
                      ].map((e) => (0, r.jsx)('option', { value: e, children: e }, e)),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'Timezone',
                    }),
                    (0, r.jsx)('select', {
                      value: s.timezone,
                      onChange: (e) => l({ ...s, timezone: e.target.value }),
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      children: [
                        'GMT-12',
                        'GMT-11',
                        'GMT-10',
                        'GMT-9',
                        'GMT-8',
                        'GMT-7',
                        'GMT-6',
                        'GMT-5',
                        'GMT-4',
                        'GMT-3',
                        'GMT-2',
                        'GMT-1',
                        'GMT+0',
                        'GMT+1',
                        'GMT+2',
                        'GMT+3',
                        'GMT+4',
                        'GMT+5',
                        'GMT+6',
                        'GMT+7',
                        'GMT+8',
                        'GMT+9',
                        'GMT+10',
                        'GMT+11',
                        'GMT+12',
                      ].map((e) => (0, r.jsx)('option', { value: e, children: e }, e)),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'Usual Sit Length',
                    }),
                    (0, r.jsx)('select', {
                      value: s.usualSitLength,
                      onChange: (e) => l({ ...s, usualSitLength: parseInt(e.target.value) }),
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      children: [5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((e) =>
                        (0, r.jsxs)('option', { value: e, children: [e, ' minutes'] }, e),
                      ),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'Why I practice',
                    }),
                    (0, r.jsx)('textarea', {
                      value: s.whyPractice,
                      onChange: (e) => l({ ...s, whyPractice: e.target.value }),
                      placeholder: 'Enter your reason',
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none',
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  children: [
                    (0, r.jsx)('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-2',
                      children: 'How to best support me',
                    }),
                    (0, r.jsx)('textarea', {
                      value: s.supportNeeds,
                      onChange: (e) => l({ ...s, supportNeeds: e.target.value }),
                      placeholder: 'Enter your support needs',
                      className:
                        'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none',
                    }),
                  ],
                }),
                (0, r.jsx)('button', {
                  type: 'submit',
                  className:
                    'w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors',
                  children: 'Find my matches',
                }),
              ],
            }),
          ],
        }),
      });
    }
  },
]);
