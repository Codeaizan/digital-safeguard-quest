# CyberShield: A Web-Based Cybersecurity Educational Game

## Overview
CyberShield is an interactive web-based educational game designed to teach players about digital safety through engaging storytelling and mini-games. The game covers various cybersecurity threats, including phishing, malware, social engineering, and ransomware, through progressive levels.

## Features
- **Story Mode**: Progressive levels covering different cybersecurity threats.
- **Interactive Mini-Games**: Engaging challenges such as "Phishing Frenzy" and "Password Protector" to test and enhance players' cybersecurity skills.
- **User Authentication**: Login, signup, and password recovery using Supabase.
- **Dashboard**: Users can edit their details, track progress, and start game levels.
- **Dark Cyber Theme**: Aesthetic inspired by platforms like HackTheBox and TryHackMe, with neon cyberpunk design elements.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Supabase (Authentication & Database)
- **Styling**: CSS (Separate CSS files for each page)
- **Deployment**: Vercel/Netlify

## Levels & Challenges
1. **Password Strength Checker**
   - Users create a strong password with real-time strength suggestions.
   - The password must meet 8 constraints, including a digit, character, and special character.
   - Points: 10 for the first attempt, decreasing with retries.

2. **Phishing Email Detection**
   - Users analyze 10 emails to determine phishing attempts.
   - Points are awarded based on correct identifications.

3. **Malware File Identification**
   - Users analyze 10 files and identify malicious ones based on behavior, process usage, origin, and permissions.
   - Full marks for correct selections.

4. **Morse Code Challenge**
   - Users send a message in Morse code following a given hint.
   - Points decrease with retries.

5. **Social Engineering Quiz**
   - 10 randomized questions to test awareness of personal information security.
   - Points are awarded for correct answers.

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/cybershield.git
   cd cybershield
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure Supabase:
   - Create a Supabase project.
   - Obtain API credentials and add them to `.env`:
     ```sh
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_anon_key
     ```
4. Run the development server:
   ```sh
   npm start
   ```
5. Deploy the project:
   ```sh
   npm run build
   ```

## Folder Structure
```
cybershield/
│── public/
│── src/
│   ├── components/    # React components
│   ├── pages/         # Different game levels
│   ├── styles/        # CSS files
│   ├── utils/         # Helper functions
│   ├── App.js         # Main entry point
│── .env               # Supabase credentials
│── package.json       # Project dependencies
│── README.md          # Project documentation
```

## Known Issues & Fixes
- **IncidentResponse Component Error**:
  - Ensure the file exists in `src/pages/IncidentResponse.js`.
  - Import the file correctly in `App.js`.
  
- **RansomwareRescue Component Error**:
  - Ensure the `handleOptionSelect` function is fully implemented and closed.
  - Check for missing return statements.

## Future Enhancements
- Additional cybersecurity challenges.
- Leaderboard system.
- Multiplayer mode.

## Contributors
- Faizanur Rahman
- Faizan Khan
- Mohammad Kaab
- Rohan Srivastava

## License
MIT License

