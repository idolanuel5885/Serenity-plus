(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  18566,
  (e, t, a) => {
    t.exports = e.r(76562);
  },
  24527,
  (e) => {
    'use strict';
    e.s(['default', () => s]);
    var t = e.i(43476),
      a = e.i(71645),
      r = e.i(18566);
    function s() {
      let e = (0, r.useRouter)(),
        [s, i] = (0, a.useState)(!1),
        [n, o] = (0, a.useState)(''),
        c = async () => {
          (i(!0), o(''));
          try {
            let e = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: 'test@example.com',
                  name: 'Test User',
                  weeklyTarget: 3,
                  primaryWindow: '06:00–09:00',
                  timezone: 'GMT+2',
                  usualSitLength: 30,
                  whyPractice: 'To find inner peace and reduce stress',
                  supportNeeds: 'Gentle reminders and encouragement',
                }),
              }),
              t = await e.json();
            t.success
              ? (localStorage.setItem('userId', t.user.id),
                o('✅ Test user created! ID: '.concat(t.user.id)))
              : o('❌ Error: '.concat(t.error));
          } catch (e) {
            o('❌ Error: '.concat(e));
          } finally {
            i(!1);
          }
        },
        l = async () => {
          (i(!0), o(''));
          try {
            let e = localStorage.getItem('userId');
            if (!e) {
              (o('❌ Please create a test user first'), i(!1));
              return;
            }
            let t = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: 'partner@example.com',
                  name: 'Priya',
                  weeklyTarget: 4,
                  primaryWindow: '07:00–10:00',
                  timezone: 'GMT+2',
                  usualSitLength: 25,
                  whyPractice: 'To improve focus and mindfulness',
                  supportNeeds: 'Accountability and motivation',
                }),
              }),
              a = await t.json();
            if (a.success) {
              let t = await fetch('/api/invite', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ inviterId: e }),
                }),
                r = await t.json();
              if (r.success) {
                let e = await fetch('/api/partnership', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      inviteCode: r.invitation.inviteCode,
                      inviteeId: a.user.id,
                    }),
                  }),
                  t = await e.json();
                t.success
                  ? o('✅ Test partnership created! You now have Priya as a partner.')
                  : o('❌ Partnership error: '.concat(t.error));
              } else o('❌ Invite error: '.concat(r.error));
            } else o('❌ Partner creation error: '.concat(a.error));
          } catch (e) {
            o('❌ Error: '.concat(e));
          } finally {
            i(!1);
          }
        };
      return (0, t.jsx)('div', {
        className: 'min-h-screen bg-white p-6',
        children: (0, t.jsxs)('div', {
          className: 'max-w-md mx-auto',
          children: [
            (0, t.jsx)('h1', {
              className: 'text-2xl font-bold mb-6',
              children: 'Development Tools',
            }),
            (0, t.jsxs)('div', {
              className: 'space-y-4',
              children: [
                (0, t.jsxs)('div', {
                  className: 'bg-blue-50 p-4 rounded-lg',
                  children: [
                    (0, t.jsx)('h2', {
                      className: 'font-semibold mb-2',
                      children: 'Test User Flow',
                    }),
                    (0, t.jsx)('p', {
                      className: 'text-sm text-gray-600 mb-4',
                      children: 'Create test data to see how the app looks with partnerships',
                    }),
                    (0, t.jsxs)('div', {
                      className: 'space-y-3',
                      children: [
                        (0, t.jsx)('button', {
                          onClick: c,
                          disabled: s,
                          className:
                            'w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50',
                          children: s ? 'Creating...' : '1. Create Test User',
                        }),
                        (0, t.jsx)('button', {
                          onClick: l,
                          disabled: s,
                          className:
                            'w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50',
                          children: s ? 'Creating...' : '2. Create Test Partnership',
                        }),
                        (0, t.jsx)('button', {
                          onClick: () => {
                            (localStorage.removeItem('userId'),
                              o('✅ Test data cleared! Refresh the page to see changes.'));
                          },
                          className:
                            'w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors',
                          children: 'Clear Test Data',
                        }),
                      ],
                    }),
                  ],
                }),
                n &&
                  (0, t.jsx)('div', {
                    className: 'bg-gray-50 p-4 rounded-lg',
                    children: (0, t.jsx)('p', { className: 'text-sm', children: n }),
                  }),
                (0, t.jsx)('div', {
                  className: 'text-center',
                  children: (0, t.jsx)('button', {
                    onClick: () => {
                      e.push('/');
                    },
                    className:
                      'bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors',
                    children: 'Go to Home',
                  }),
                }),
              ],
            }),
          ],
        }),
      });
    }
  },
]);
