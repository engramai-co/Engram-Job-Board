import { useState } from "react";
import { currency, data, recurringCash, yearOneCash } from "../lib";

export function OfferBaseline() {
  const [mode, setMode] = useState<"yearOne" | "recurring">("yearOne");
  const offer = data.signedOffer;
  if (!offer || yearOneCash === null || recurringCash === null) return null;
  const yearOne = mode === "yearOne";
  const formula = [`${currency.format(offer.base)} base`, `${currency.format(offer.projectedBonus)} projected bonus`, ...(yearOne ? [`${currency.format(offer.firstYearSignOn)} sign-on`] : [])];

  return (
    <section className="baseline-sheet" aria-labelledby="baseline-heading">
      <div className="section-heading baseline-heading">
        <div><h2 id="baseline-heading">Offer baseline</h2><p>{offer.company} · {offer.officialTitle} ({offer.role})</p></div>
        <span className="status-stamp">{offer.status}</span>
      </div>
      <div className="baseline-grid">
        <div className="baseline-copy">
          <div className="signed-role"><strong>{offer.company}</strong><span>{offer.officialTitle}</span><small>{offer.role} · {offer.source}</small></div>
          <p className="baseline-statement">Compare alternatives on compensation, career trajectory, and work content—not the headline number alone. Projected bonus is not guaranteed; equity and benefits are excluded from cash totals.</p>
          <div className="view-switch" role="group" aria-label="Compensation view">
            <button className={`view-switch__button${yearOne ? " is-selected" : ""}`} type="button" aria-pressed={yearOne} onClick={() => setMode("yearOne")}>Year 1 cash</button>
            <button className={`view-switch__button${!yearOne ? " is-selected" : ""}`} type="button" aria-pressed={!yearOne} onClick={() => setMode("recurring")}>Recurring cash</button>
          </div>
        </div>
        <div className="hurdle-ledger" aria-live="polite">
          <div className="hurdle-total">{currency.format(yearOne ? yearOneCash : recurringCash)}</div>
          <div className="hurdle-caption">{yearOne ? "Estimated first-year cash" : "Estimated recurring annual cash"}</div>
          <div className="formula">{formula.map((part, index) => <span key={part}>{index > 0 && <b>+</b>}<span>{part}</span></span>)}</div>
        </div>
        <dl className="signed-terms" aria-label="Offer baseline terms">
          <div><dt>Base</dt><dd>{currency.format(offer.base)}</dd></div><div><dt>Projected bonus</dt><dd>{currency.format(offer.projectedBonus)}</dd></div><div><dt>First-year sign-on</dt><dd>{currency.format(offer.firstYearSignOn)}</dd></div><div className="signed-terms__note"><dt>Verification</dt><dd>{offer.verified ? "User-marked verified" : "Not verified"}</dd></div>
        </dl>
      </div>
    </section>
  );
}
