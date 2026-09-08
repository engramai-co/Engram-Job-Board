import { data, formatDate, parseLocalDate } from "../lib";

export function InterviewProcess() {
  return (
    <section className="process-section" aria-labelledby="interview-heading">
      <div className="section-heading">
        <div><h2 id="interview-heading">Interview process</h2><p>Upcoming rounds, decisions, and preparation checkpoints.</p></div>
        <div className="queue-total"><strong>{data.interviews.length}</strong><span>scheduled</span></div>
      </div>
      {!data.interviews.length ? (
        <div className="empty-band"><span className="empty-band__line" aria-hidden="true"/><div><strong>No interviews scheduled</strong><p>Dates and stages will be connected to their opportunity records.</p></div></div>
      ) : (
        <div className="interview-list">
          {data.interviews.map((interview) => {
            const opportunity = data.opportunities.find((item) => item.id === interview.opportunityId);
            return <div className="interview-entry" key={`${interview.opportunityId}-${interview.date}`}><span className="table-number">{formatDate(parseLocalDate(interview.date), { day: "2-digit", month: "short", year: "numeric" })}</span><strong>{opportunity?.company || "Unlinked opportunity"} · {interview.stage}</strong><span>{interview.status || "Scheduled"}</span></div>;
          })}
        </div>
      )}
    </section>
  );
}
