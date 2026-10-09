import { useState } from "react";
import { currency, data, recurringCash, yearOneCash } from "../lib";

export function OfferBaseline() {
  const [mode, setMode] = useState<"yearOne" | "recurring">("yearOne");
  const offer = data.signedOffer;
  if (!offer || yearOneCash === null || recurringCash === null) return null;
  const yearOne = mode === "yearOne";
  const formula = [`${currency.format(offer.base)} base`, `${currency.format(offer.projectedBonus)} 预期 bonus`, ...(yearOne ? [`${currency.format(offer.firstYearSignOn)} sign-on`] : [])];

  return (
    <section className="baseline-sheet" aria-labelledby="baseline-heading">
      <div className="section-heading baseline-heading">
        <div><h2 id="baseline-heading">Offer 比较基准</h2><p>{offer.company} · {offer.officialTitle} ({offer.role})</p></div>
        <span className="status-stamp">{offer.status}</span>
      </div>
      <div className="baseline-grid">
        <div className="baseline-copy">
          <div className="signed-role"><strong>{offer.company}</strong><span>{offer.officialTitle}</span><small>{offer.role} · {offer.source}</small></div>
          <p className="baseline-statement">结合薪资、职业发展与工作内容比较机会，不只看总额。预期 bonus 不保证发放；现金合计不包含 equity 和福利。</p>
          <div className="view-switch" role="group" aria-label="薪资比较口径">
            <button className={`view-switch__button${yearOne ? " is-selected" : ""}`} type="button" aria-pressed={yearOne} onClick={() => setMode("yearOne")}>首年现金</button>
            <button className={`view-switch__button${!yearOne ? " is-selected" : ""}`} type="button" aria-pressed={!yearOne} onClick={() => setMode("recurring")}>后续年度现金</button>
          </div>
        </div>
        <div className="hurdle-ledger" aria-live="polite">
          <div className="hurdle-total">{currency.format(yearOne ? yearOneCash : recurringCash)}</div>
          <div className="hurdle-caption">{yearOne ? "预估首年现金" : "预估后续年度现金"}</div>
          <div className="formula">{formula.map((part, index) => <span key={part}>{index > 0 && <b>+</b>}<span>{part}</span></span>)}</div>
        </div>
        <dl className="signed-terms" aria-label="Offer 条款">
          <div><dt>Base</dt><dd>{currency.format(offer.base)}</dd></div><div><dt>预期 bonus</dt><dd>{currency.format(offer.projectedBonus)}</dd></div><div><dt>首年 sign-on</dt><dd>{currency.format(offer.firstYearSignOn)}</dd></div><div className="signed-terms__note"><dt>核验情况</dt><dd>{offer.verified ? "用户确认已核验" : "尚未核验"}</dd></div>
        </dl>
      </div>
    </section>
  );
}
