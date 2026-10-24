import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function SetPasswordView() {
  const { data, setAuthorPassword } = useApp();
  const email = data.session.who || '';

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw1.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setAuthorPassword(email, pw1);
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white border border-[#d5deeb] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-bold text-[#0d3b6e]">
            Set Your Author Password
          </h2>
          <p className="text-xs text-[#55657d] mt-1">
            Account Email: <b className="text-slate-800">{email}</b>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            This verification link was issued via your manuscript acknowledgement email.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (minimum 8 characters)
            </label>
            <input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f2b01e] focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0d3b6e] hover:bg-[#0a2d54] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
          >
            Save Password & Proceed to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
