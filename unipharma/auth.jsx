// auth.jsx — Login screen (shown only when cloud is enabled & login is required)
// Users log in with a USERNAME; we append a fixed internal domain so the
// Supabase email/password provider works without anyone typing an email.
// Clean light design, independent of the app's dark/light theme.
const LOGIN_DOMAIN = 'unipharma.local';
function LoginScreen({ L, onSignedIn }) {
  const { useState } = React;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    const u = username.trim();
    const loginId = u.includes('@') ? u : `${u}@${LOGIN_DOMAIN}`;
    const res = await window.UNI_DB.signIn(loginId, password);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    onSignedIn();
  };

  return (
    <div className="lg-wrap">
      <style>{`
        .lg-wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
          padding:20px;overflow:hidden;background:#eef4fb;font-family:'Noto Sans Thai','Inter',sans-serif}
        .lg-blob{position:absolute;border-radius:50%;filter:blur(72px);opacity:.45;animation:lg-float 16s ease-in-out infinite}
        .lg-b1{width:440px;height:440px;background:#1177cc;top:-140px;left:-120px}
        .lg-b2{width:400px;height:400px;background:#06b6d4;bottom:-140px;right:-110px;animation-delay:-8s}
        .lg-b3{width:300px;height:300px;background:#7cc7ff;top:40%;left:55%;animation-delay:-4s;opacity:.3}
        @keyframes lg-float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(46px,34px) scale(1.08)}}
        .lg-card{position:relative;z-index:1;width:100%;max-width:400px;background:#fff;border-radius:22px;
          padding:40px 36px;box-shadow:0 24px 64px rgba(17,119,204,.20),0 2px 8px rgba(17,119,204,.08);
          animation:lg-in .55s cubic-bezier(.2,.85,.25,1)}
        @keyframes lg-in{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
        .lg-logo{width:72px;height:72px;margin:0 auto 14px;border-radius:18px;background:#fff;
          box-shadow:0 8px 24px rgba(17,119,204,.18);display:flex;align-items:center;justify-content:center;
          animation:lg-pop .6s .1s both cubic-bezier(.2,1.4,.4,1)}
        @keyframes lg-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
        .lg-logo img{width:50px;height:50px;object-fit:contain}
        .lg-brand{text-align:center;font-size:22px;font-weight:800;letter-spacing:.5px;
          background:linear-gradient(120deg,#1177cc,#06b6d4);-webkit-background-clip:text;background-clip:text;color:transparent}
        .lg-sub{text-align:center;font-size:12.5px;color:#7794ad;margin-top:2px;margin-bottom:26px}
        .lg-label{display:block;font-size:13px;font-weight:600;color:#3f6489;margin-bottom:6px}
        .lg-group{margin-bottom:16px}
        .lg-input{width:100%;padding:12px 14px;border:1.5px solid #e1ebf5;border-radius:12px;font-size:14px;
          color:#0b2a45;background:#f6fafe;transition:border-color .2s,box-shadow .2s,background .2s;outline:none;font-family:inherit}
        .lg-input::placeholder{color:#a7bdd1}
        .lg-input:focus{border-color:#1177cc;background:#fff;box-shadow:0 0 0 4px rgba(17,119,204,.13)}
        .lg-btn{width:100%;padding:13px;border:none;border-radius:12px;font-size:15px;font-weight:700;color:#fff;
          cursor:pointer;font-family:inherit;background:linear-gradient(135deg,#1177cc,#06b6d4);background-size:160% 160%;
          box-shadow:0 10px 24px rgba(17,119,204,.32);transition:transform .18s,box-shadow .18s,background-position .4s;margin-top:4px}
        .lg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 30px rgba(17,119,204,.42);background-position:100% 100%}
        .lg-btn:active:not(:disabled){transform:translateY(0)}
        .lg-btn:disabled{opacity:.65;cursor:default}
        .lg-err{background:#fdebec;color:#d63031;padding:9px 13px;border-radius:10px;font-size:12.5px;
          margin-bottom:14px;border:1px solid #f8d2d4;animation:lg-shake .35s}
        @keyframes lg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
        .lg-foot{text-align:center;font-size:11.5px;color:#9db4c9;margin-top:18px}
        @media(prefers-reduced-motion:reduce){.lg-blob,.lg-card,.lg-logo,.lg-btn,.lg-err{animation:none!important}}
      `}</style>

      <div className="lg-blob lg-b1"></div>
      <div className="lg-blob lg-b2"></div>
      <div className="lg-blob lg-b3"></div>

      <form onSubmit={submit} className="lg-card">
        <div className="lg-logo"><img src="assets/logo.png" alt="Unipharma" /></div>
        <div className="lg-brand">UNIPHARMA</div>
        <div className="lg-sub">{L('ระบบจัดการการสั่งซื้อ', 'Purchasing Management')}</div>

        <div className="lg-group">
          <label className="lg-label">{L('ชื่อผู้ใช้', 'Username')}</label>
          <input className="lg-input" type="text" autoComplete="username" value={username}
            onChange={e => setUsername(e.target.value)} placeholder={L('เช่น admin', 'e.g. admin')} required autoFocus />
        </div>
        <div className="lg-group">
          <label className="lg-label">{L('รหัสผ่าน', 'Password')}</label>
          <input className="lg-input" type="password" autoComplete="current-password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        {err && <div className="lg-err">{L('เข้าสู่ระบบไม่สำเร็จ: ', 'Sign-in failed: ')}{err}</div>}

        <button className="lg-btn" type="submit" disabled={busy}>
          {busy ? L('กำลังเข้าสู่ระบบ…', 'Signing in…') : L('เข้าสู่ระบบ', 'Sign in')}
        </button>

        <div className="lg-foot">{L('ติดต่อผู้ดูแลระบบเพื่อขอบัญชีผู้ใช้', 'Contact your admin for an account')}</div>
      </form>
    </div>
  );
}
