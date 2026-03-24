const WELCOME_CHIPS = [
  { label: 'Search patient', query: 'Search for patient Ethan Carter' },
  { label: 'View conditions', query: 'Show conditions for patient 44231' },
  { label: 'Lab results', query: 'What is the hemoglobin count for patient 44231?' },
  { label: 'Medications', query: 'List medications for patient 44231' },
  { label: 'Encounters', query: 'Show encounters for patient 44231' },
];

export function WelcomeCard({ userName, onChipClick }) {
  return (
    <div className="welcome-card">
      <img src="/chatbot_image/chatbot.png" alt="CareBridge" />
      <h3>Hey {userName}, how can I assist you today?</h3>
      <p>Search patient records, retrieve lab results, conditions, medications, encounters, and procedures.</p>
      <div className="welcome-chips">
        {WELCOME_CHIPS.map((chip) => (
          <span
            key={chip.query}
            className="chip"
            role="button"
            tabIndex={0}
            onClick={() => onChipClick(chip.query)}
            onKeyDown={(e) => e.key === 'Enter' && onChipClick(chip.query)}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
