const TARGET_DATE = new Date("2027-01-15T00:00:00");
const START_DATE = new Date("2026-06-21T00:00:00");
import { testSchedule as defaultSchedule } from "./testData.js";
import { getStorage } from "./storage.js";

let dynamicTestSchedule = [];

const QUOTES = [
  "FACT: Over 1.4 million students will write JEE. Only the top 1% get into top IITs. Someone is outworking you right now.",
  "FACT: Dropping just 1 mark in a high-scoring shift can cost you over 2,000 ranks. Every single negative mark is fatal.",
  "Wake up. The syllabus is vast, the clock is ticking, and the exam doesn't care about your excuses. Study.",
  "TIP: Stop passively reading solutions. 80% of retention comes from struggling with the problem yourself first.",
  "With 14 lakh competitors, 'average' effort guarantees failure. You must be exceptional today.",
  "FACT: Only 1 in 5 JEE Mains candidates will qualify for Advanced. Are your current study habits enough to be that 1?",
  "TIP: Target your weak topics now. The exam will mercilessly expose whatever you choose to skip today.",
  "DATA: Students who attempt 15+ full syllabus mock tests before January score significantly higher. Don't fear the mocks.",
  "PREDICTION: Your final rank is being decided by what you choose to do in this exact moment. Open your books.",
  "You have less time than you think. Every hour wasted is an hour a competitor spent mastering a concept.",
  "FACT: 40% of the JEE Mains paper is usually derived from High-Weightage, Low-Effort chapters. Prioritize ruthlessly.",
  "TIP: Review your mistakes immediately. Solving 50 questions and analyzing the 10 you got wrong is better than solving 100 mindlessly.",
  "The margin for error is zero. 99 Percentile requires ruthless accuracy and speed. Start timing your practice.",
  "If you are resting because you feel 'burnt out', remember that your competition is tired too, but they are still studying.",
  "TIP: Use the 'Feynman Technique'. If you can't explain a physics concept simply to yourself, you don't actually understand it.",
  "FACT: The difference between 98 and 99 percentile is often just 3 to 4 questions. A single silly mistake changes your entire college tier.",
  "DATA: Nearly 70% of students plateau at 120 marks because they refuse to analyze their mock tests. Don't be a statistic.",
  "While you scroll your feed for 15 minutes, a top-ranker just solved a block of 5 Advanced-level physics problems. Get back to work.",
  "PREDICTION: The paper will have at least 5 deliberately time-consuming traps. If you haven't practiced skipping questions, you will panic and fail.",
  "FACT: At the 99th percentile, every single mark pushes you past thousands of students. A +4 is a massive leap; a -1 is a freefall.",
  "TIP: Highlighting notes is not studying. If your pen isn't moving on rough paper, you are lying to yourself about learning.",
  "WARNING: The 'Illusion of Competence' destroys ranks. Recognizing a formula when you see the solution does NOT mean you can apply it under pressure.",
  "FACT: The NTA will test exceptions in Inorganic Chemistry that you thought were 'too obscure to appear.' Memorize them today.",
  "TIP: Stop watching endless strategy videos on YouTube. Strategy without execution is just procrastination in disguise. Close the tab.",
  "PREDICTION: Your brain will beg you to skip the tough integer-type questions in the exam. Train your endurance now, or you will fold later.",
  "Wake up. There are only so many weekends left before the exam. Count them. The number should terrify you into action.",
  "FACT: Consistency beats a 14-hour study binge followed by a 3-day slump. The syllabus only respects daily, relentless grinding.",
  "TIP: Treat your study desk like an exam hall. No music, no phone, no snacks. Train in the exact conditions you will fight in.",
  "DATA: Over 50% of students lose out on top NITs because they messed up Chemistry, the most scoring subject. Stop ignoring NCERT.",
  "The exam date is a brick wall approaching at high speed. You can either build a vehicle to crash through it, or get crushed. Study.",
  "FACT: A bad mock test score doesn't define you, but your refusal to analyze the wrong answers absolutely will.",
  "TIP: Maintain a 'Mistake Book'. If you aren't reviewing your past errors, you are practically guaranteeing you will repeat them on D-Day.",
  "PREDICTION: The first 15 minutes of the exam will induce panic. Those who have given 30+ mock tests will breathe through it; the rest will freeze.",
  "FACT: Guessing answers out of desperation yields negative marks 75% of the time. Precision is your only shield.",
  "Stop waiting for the 'perfect time' to give a full-syllabus mock. You will never feel 100% ready. Take the test today.",
  "FACT: Modern Physics and Thermodynamics carry immense weightage. Skipping them is intellectual suicide for your rank.",
  "TIP: In Mathematics, lengthy calculations are the enemy. If a problem takes more than 4 minutes, you missed the trick. Find the trick.",
  "DATA: 8 out of 10 students fail to complete the Math section. Speed is just as critical as conceptual clarity.",
  "FACT: Normalization across shifts is ruthless. An 'easy' paper means silly mistakes are punished ten times harder. You cannot afford to lose focus.",
  "TIP: Read the question twice. 'Incorrect' vs 'Correct', 'True' vs 'False'—these single words claim lakhs of negative marks every year.",
  "You are not 'competing with yourself.' You are competing with 1.4 million highly driven teenagers who want exactly what you want. Act like it.",
  "FACT: Talent is irrelevant at this stage. The student who solves 150 questions a day will obliterate the 'smart' student who relies on intuition.",
  "PREDICTION: January attempt is your best shot at a top percentile before the board exam chaos. Do not treat it as a 'trial run.'",
  "TIP: When you feel like quitting, ask yourself: 'Can I do just one more question?' Build the habit of pushing past your breaking point.",
  "Motivation is a myth. Discipline is what gets you a seat in an IIT. Sit down and study even when you absolutely hate it.",
  "FACT: The syllabus doesn't care about your headache, your burnout, or your bad mood. The exam date is fixed. Keep moving forward.",
  "DATA: Candidates who sleep less than 6 hours before a mock score 15% lower due to cognitive lag. Rest properly, but don't oversleep.",
  "TIP: Don't fall in love with a tough question. Ego-solving during the exam destroys time management. Skip it and survive.",
  "FACT: Every hour you spend rationalizing your lack of preparation is an hour you could have spent fixing it.",
  "PREDICTION: In the final month, anxiety will peak. Your foundation—built right now, today—is the only thing that will keep you from collapsing.",
  "TIP: Master your calculator-free arithmetic. A single calculation error at the final step turns 5 minutes of hard work into a negative score.",
  "FACT: Half the competition eliminates themselves by panicking or giving up in December. Staying calm and consistent puts you ahead of 700,000 people.",
  "DATA: Nearly 30% of the paper is directly formula-based. If your formula sheet isn't memorized perfectly, you are leaving free marks on the table.",
  "TIP: When reviewing a mock test, re-solve the unattempted questions before looking at the solutions. Force your brain to bridge the gap.",
  "Stop complaining about the toughness of a chapter. The tougher it is, the more your competition avoids it. Make it your weapon.",
  "FACT: Your parents' money can buy coaching, but it cannot buy a rank. The sweat and the late nights have to be entirely yours.",
  "PREDICTION: When the results are announced, you will either feel immense relief or crushing regret. The choice between the two is being made right now.",
  "TIP: Isolate yourself from friends who normalize slacking off. Mediocrity is contagious. Surround yourself with the pressure to succeed.",
  "FACT: A 'lucky guess' strategy is a guaranteed path to failure in Advanced. You cannot cheat the system; you must conquer the concepts.",
  "Look at the syllabus tracker. Look at the calendar. Do the math. Your current speed is likely not enough. Accelerate immediately.",
  "TIP: During revision, don't read the theory again. Solve 30 mixed questions. The questions will instantly expose which theory you actually forgot.",
  "FACT: Droppers are fighting for their last chance. They have seen the bloodbath of the exam hall. You are up against battle-tested veterans.",
  "DATA: A +10 mark improvement in the 150-180 range can jump your rank by over 10,000. Every single question is a matter of life and death.",
  "TIP: Stop relying on 'one-shot' videos for complex chapters. There are no shortcuts to the top. You have to read the text and do the grueling work.",
  "FACT: The pain of discipline weighs ounces, but the pain of regret weighs tons. Pick up your pen. It's time to work.",
  "FACT: The difference between AIR 5,000 and AIR 15,000 is often just a handful of questions. Tiny improvements create massive rank jumps.",
  "TIP: If you can't solve a question without looking at notes, you haven't revised that chapter enough.",
  "WARNING: The exam does not reward the student who studied the most hours. It rewards the student who performs best for 3 hours.",
  "DATA: Most students spend less than 10% of their preparation time on revision. That's why they forget what they learned.",
  "PREDICTION: At least one question in the exam will come from a chapter you almost decided to skip.",
  "FACT: Every topper has a collection of embarrassing mistakes. The difference is they learned from them.",
  "TIP: Spend more time understanding why you got questions wrong than admiring the ones you got right.",
  "Wake up. Your future rank is hiding inside the chapter you are avoiding right now.",
  "FACT: The average aspirant underestimates how much revision is required to retain concepts for JEE.",
  "TIP: Solve previous-year questions before declaring a chapter 'completed.'",
  "DATA: Students who revise a chapter 4-5 times retain dramatically more than those who revise it only once.",
  "FACT: One hour of focused study beats four hours of distracted studying.",
  "PREDICTION: The topics you revise in the final week will feel surprisingly familiar during the actual exam.",
  "TIP: Learn to recognize when a question is not worth your time. Selection is a skill.",
  "FACT: Most negative marks are caused by avoidable mistakes, not lack of knowledge.",
  "WARNING: Your brain confuses familiarity with mastery. Reading solutions repeatedly is dangerous.",
  "TIP: After every mock, identify the three biggest reasons you lost marks and fix them immediately.",
  "FACT: The student who improves by 1% every day becomes unstoppable after a year.",
  "DATA: Thousands of candidates lose ranks every year due to poor time management rather than poor concepts.",
  "Wake up. There are students solving questions right now while you are deciding whether to start.",
  "TIP: Don't memorize derivations blindly. Understand where every equation comes from.",
  "FACT: JEE rewards pattern recognition. The more quality questions you solve, the more patterns you see.",
  "WARNING: Waiting for motivation is a trap. Successful students study regardless of motivation.",
  "PREDICTION: Your toughest mock test will eventually become easier than your current easiest one.",
  "TIP: Keep your rough work organized. Messy calculations create unnecessary mistakes.",
  "FACT: Confidence in the exam hall is earned months earlier through preparation.",
  "DATA: Most aspirants spend too much time perfecting strengths and too little fixing weaknesses.",
  "TIP: Revise formulas during short breaks instead of scrolling social media.",
  "FACT: A chapter you understand deeply is worth more than three chapters you studied superficially.",
  "Wake up. Every day you delay revision, your memory quietly deletes your hard work.",
  "PREDICTION: The student who remains calm during difficult sections will outperform more knowledgeable students who panic.",
  "TIP: Solve mixed-topic questions regularly. The exam won't announce which chapter a question belongs to.",
  "FACT: You do not need to know everything. You need to know enough to score better than everyone else.",
  "WARNING: Perfectionism causes more backlog than laziness.",
  "DATA: Most students overestimate their accuracy and underestimate their silly mistakes.",
  "TIP: Finish easy questions first. Free marks are more valuable than ego battles.",
  "FACT: Your mock test rank is feedback, not destiny.",
  "Wake up. The calendar is moving whether you study or not.",
  "TIP: Learn shortcut methods only after mastering the fundamental method.",
  "FACT: A chapter revised five times is stronger than a chapter studied once for ten hours.",
  "PREDICTION: The questions that scare you today will become routine if you practice them consistently.",
  "DATA: Students who maintain a mistake notebook often see faster score improvement than those who don't.",
  "TIP: The best time to fix a weakness is the moment you discover it.",
  "FACT: Most rank improvements come from eliminating mistakes, not learning new tricks.",
  "WARNING: The syllabus is patient. It waits silently until exam day to punish neglect.",
  "TIP: Study difficult subjects when your energy is highest, not when you're exhausted.",
  "FACT: Every solved problem increases the probability of recognizing a similar pattern in the exam.",
  "Wake up. Nobody remembers how many hours you studied. They remember your rank.",
  "PREDICTION: Six months from now, you'll either be grateful for today's effort or wishing you had started sooner.",
  "FACT: Discipline compounds. One productive day makes the next productive day easier.",
  "FACT: 200 days is 4,800 hours. Even if you study only 6 focused hours daily, that's 1,200 hours of preparation. Stop saying there isn't enough time.",
  "DATA: 200 days × 50 questions per day = 10,000 questions solved before JEE. That's enough to see almost every important pattern repeatedly.",
  "FACT: A student who starts today with 200 days left can revise an entire chapter 8-10 times before the exam.",
  "PREDICTION: The student who thinks 200 days is too little will waste them. The student who thinks 200 days is enough will change their life.",
  "Wake up. AIR 1 and AIR 10000 both have exactly the same 200 days remaining.",
  "FACT: If you complete just 1% of the syllabus daily, you can theoretically cover it twice in 200 days.",
  "DATA: 200 days of 7 hours daily equals 1,400 hours. That's more focused study than many students achieve in two years.",
  "TIP: Stop counting months. Count study sessions. 200 days gives you hundreds of opportunities to improve.",
  "FACT: Most aspirants waste more than 100 days before becoming serious. Don't be one of them.",
  "PREDICTION: The chapter you master in the next 7 days will still be scoring marks for you 200 days later.",
  "FACT: 200 days is enough to solve every JEE Main PYQ from the last several years multiple times.",
  "DATA: One mock test every 5 days for 200 days equals 40 full-length mocks before the exam.",
  "FACT: 200 days of consistency beats 700 days of excuses.",
  "Wake up. You don't need another year. You need a productive day repeated 200 times.",
  "TIP: Win today. Then win tomorrow. Repeat that process 200 times and watch what happens.",
  "FACT: Many students who score 99+ percentile were nowhere near that level 200 days earlier.",
  "PREDICTION: Future you will laugh at how impossible success seemed on Day 1.",
  "DATA: 200 days × 30 formula revisions per day = 6,000 formula reviews before the exam.",
  "FACT: In 200 days, you can turn every weak chapter into an average chapter and every average chapter into a strength.",
  "WARNING: 200 days feels long until it becomes 100 days. Then 50. Then 10. Start now.",
  "FACT: The syllabus is huge, but 200 days is also huge. Your brain is capable of more than you think.",
  "TIP: Focus on high-weightage chapters first. 200 days is enough to build a frighteningly strong score base.",
  "PREDICTION: Your biggest regret won't be failing. It will be realizing 200 days was enough and you wasted them.",
  "FACT: A student improving by just one mark per day becomes 200 marks better by the end of 200 days.",
  "Wake up. The comeback you think requires a miracle might only require 200 disciplined days.",
  "FACT: 200 days from now, someone who currently scores 80 marks will be scoring 220. Why can't it be you?",
  "DATA: 200 days gives enough time for 10 complete revisions of your formula notebook.",
  "PREDICTION: The difference between your dream college and your backup college will be determined by how you use the next 200 days.",
  "FACT: Every IITian once had a Day 200 countdown. Their secret wasn't time. It was consistency.",
  "TIP: Study 8 hours today and you bank 1/25th of a 200-hour improvement block.",
  "FACT: In 200 days, you can finish NCERT, coaching modules, PYQs, mocks, and still have revision time.",
  "Wake up. Your competition is not waiting for Day 100 to start. They're attacking Day 1.",
  "DATA: 200 days × 3 subjects = roughly 66 days per subject. That's enough to rebuild your entire preparation.",
  "FACT: One chapter every 3 days means over 60 chapters completed before JEE.",
  "PREDICTION: If you become consistent today, your current mock scores will look embarrassing 100 days from now.",
  "TIP: Don't think about AIR. Think about today's 50 questions.",
  "FACT: Most students fail because they waste their first 100 days and panic in their last 30.",
  "WARNING: Day 200 becomes Day 100 much faster than you think.",
  "FACT: A serious student can solve more than 15,000 quality questions in 200 days.",
  "DATA: 200 days of eliminating one mistake per day removes 200 future mistakes from your exam.",
  "PREDICTION: Your confidence on exam day will be directly proportional to what you do during these 200 days.",
  "FACT: 200 days is enough time to completely reinvent your Mathematics score.",
  "TIP: Build a streak. Protect it. Let it grow for 200 days.",
  "FACT: You are never 200 days away from failure. You are always 200 days away from massive improvement.",
  "Wake up. Somewhere, a student weaker than you just started working harder than you.",
  "FACT: The student who studies today gains an advantage. The student who studies for 200 consecutive days becomes unstoppable.",
  "PREDICTION: If you stay disciplined for 200 days, your friends will call your success 'luck.'",
  "DATA: Just 5 productive hours daily for 200 days creates 1,000 hours of focused preparation.",
  "FACT: 200 days from now, excuses will have produced nothing. Effort will have produced a rank.",
  "The clock is running. Every sunrise removes one of your 200 opportunities forever. Use today's opportunity.",
  "TIP: Before opening the solution, force yourself to spend at least 10 minutes thinking. Struggle is where learning happens.",
"TIP: After every mock test, write down the top 3 reasons you lost marks. Fix those before taking the next mock.",
"TIP: Keep a dedicated notebook for mistakes. Review it every Sunday. Your rank is hiding inside that notebook.",
"TIP: If a chapter feels weak, solve 30 questions from it before revisiting theory. Let the questions identify your gaps.",
"TIP: Spend the first 15 minutes of every study session revising yesterday's work. Retention compounds.",
"TIP: Don't measure progress in hours studied. Measure it in quality questions solved and concepts mastered.",
"TIP: During revision, solve mixed-topic questions. The real exam won't tell you which chapter a question belongs to.",
"TIP: For every formula you memorize, solve at least 5 questions that use it. Formulas without application are useless.",
"TIP: Maintain a one-page formula sheet for each chapter. Revise it repeatedly instead of rereading entire notes.",
"TIP: When a question takes too long, don't immediately look at the solution. Leave it and retry later with a fresh mind.",
"TIP: Learn the art of skipping. The fastest way to gain marks is often avoiding time-wasting questions.",
"TIP: Re-solve difficult questions 7-10 days later. Real mastery means solving them without hints.",
"TIP: Practice mental calculations daily. Faster arithmetic directly improves your effective exam time.",
"TIP: Start mocks at the exact time your actual exam will be held. Train your brain's peak performance window.",
"TIP: Keep your phone outside your room during deep work sessions. Willpower is weaker than environment design.",
"TIP: Study difficult topics when your energy is highest, not at the end of the day.",
"TIP: Revise Inorganic Chemistry through active recall, not passive reading. Close the book and test yourself.",
"TIP: If you repeatedly make the same mistake, create a rule for it and write that rule in your mistake notebook.",
"TIP: Solve previous-year questions before touching advanced material. PYQs reveal what the exam actually values.",
"TIP: Don't just solve questions. Classify your mistakes: Concept Error, Calculation Error, Reading Error, or Panic Error.",
"TIP: Review solved examples only after attempting similar questions yourself.",
"TIP: Use a timer for practice. Untimed practice creates a false sense of confidence.",
"TIP: Every Sunday, list your 5 weakest topics and attack at least one of them the next week.",
"TIP: Don't chase difficult questions all day. Secure easy and medium-level mastery first.",
"TIP: If your accuracy is below 80%, focus on reducing mistakes before increasing speed.",
"TIP: Sleep at a consistent time. Memory consolidation is part of studying.",
"TIP: Create a 'Last 30 Days Revision List' long before the last 30 days arrive.",
"TIP: Learn standard question patterns. JEE often tests old concepts through new-looking questions.",
"TIP: Whenever you forget a formula, derive it once. Understanding creates stronger memory than repetition.",
"TIP: Solve chapter tests without notes. Open-book practice creates fake confidence.",
"TIP: Track mock scores in a spreadsheet. Trends matter more than individual scores.",
"TIP: Read every question carefully. Many marks are lost because students solve a different question than the one asked.",
"TIP: Focus on understanding why the correct option is correct, not just why your option was wrong.",
"TIP: Revise high-weightage chapters more frequently than low-weightage ones.",
"TIP: Study in blocks of intense focus rather than marathon sessions filled with distractions.",
"TIP: If a chapter has fewer than 100 quality questions solved, consider it underprepared.",
"TIP: Don't ignore easy chapters. Easy chapters often provide the safest marks.",
"TIP: Create flashcards for reactions, exceptions, and frequently forgotten facts.",
"TIP: Before every mock, revise formulas instead of learning new concepts.",
"TIP: If your mock score stagnates, increase analysis quality before increasing study hours.",
"TIP: Learn to recognize when a solution uses a shortcut. Add that shortcut to your notes.",
"TIP: Practice solving questions from memory without immediately writing equations from notes.",
"TIP: Use active recall while revising. Close the book and reproduce concepts from memory.",
"TIP: Don't compare your preparation to others daily. Compare today's performance to last week's.",
"TIP: Maintain physical fitness. Better stamina directly improves concentration during long exams.",
"TIP: If you can teach a topic to someone else, you're probably ready for JEE-level questions from it.",
"TIP: Schedule revision sessions before forgetting happens, not after.",
"TIP: Treat every mock like the real exam and every real exam like a mock.",
"TIP: Prioritize consistency. Five productive hours every day beats fifteen hours once a week.",
"TIP: The best study plan is the one you actually follow. Simplicity beats perfection.",
"TIP: If a chapter has less than 3 revision cycles, assume you've forgotten half of it already.",
"TIP: After solving a question, ask yourself: 'What was the key observation?' The observation is more important than the solution.",
"TIP: Keep a separate notebook called 'Things I Keep Forgetting'. Review it every 3 days.",
"TIP: Never end a study session immediately after getting stuck. Solve one easier question first to maintain momentum.",
"TIP: If you get a question wrong, solve two more questions of the exact same type immediately.",
"TIP: The fastest way to improve Physics is to identify which formulas you fail to recognize under pressure.",
"TIP: Before watching a solution video, write down exactly where your approach failed.",
"TIP: Every 15 days, take a test consisting only of previously mistaken questions.",
"TIP: Learn the common traps in each chapter. JEE repeats traps more often than it repeats questions.",
"TIP: If you cannot solve a PYQ from a chapter, that chapter is not revised no matter how many notes you've read.",
"TIP: During revision, spend 70% of your time solving questions and 30% reviewing theory.",
"TIP: Make a list of the 50 highest-frequency formulas in Physics. They should become automatic.",
"TIP: After every mock, rank your mistakes by marks lost. Fix the most expensive mistakes first.",
"TIP: Create a 'Top 20 Weak Areas' list. If a weakness isn't written down, it rarely gets fixed.",
"TIP: Stop saying 'I know this chapter.' Prove it by solving 20 random questions from it.",
"TIP: If a question requires a trick, write the trick down. Build your own database of insights.",
"TIP: Revisit difficult questions after 30 days. Long-term retention matters more than short-term mastery.",
"TIP: Don't solve questions in chapter order forever. The exam is mixed; your practice should become mixed too.",
"TIP: Every night, write the three most important things you learned that day.",
"TIP: Keep a separate error log for Calculation Errors. These are often the easiest marks to recover.",
"TIP: Learn to estimate answers quickly. Estimation eliminates many wrong options immediately.",
"TIP: When solving Math, write cleaner rough work. Organization reduces calculation mistakes dramatically.",
"TIP: Solve one difficult problem every day, even during revision season. Difficulty tolerance is a skill.",
"TIP: For Organic Chemistry, revise reactions by mechanism groups, not chapter names.",
"TIP: Memorize standard results only after understanding where they come from.",
"TIP: Every week, spend one hour reviewing old mock tests instead of taking a new one.",
"TIP: Track your chapter-wise accuracy percentage. Accuracy reveals weaknesses better than marks.",
"TIP: If your score is stuck, reduce the number of new questions and increase analysis time.",
"TIP: Learn which chapters produce the highest marks per hour invested and prioritize accordingly.",
"TIP: Mark excellent questions with a star. Revisit them during the final month.",
"TIP: Build a habit of checking units before finalizing Physics answers.",
"TIP: Before every mock, remind yourself that the goal is maximizing marks, not solving every question.",
"TIP: Create a formula sheet small enough to revise completely in 20 minutes.",
"TIP: Spend more time understanding why options are wrong in MCQs. That's where many hidden concepts lie.",
"TIP: If a chapter feels impossible, solve the easiest 20 questions first and build upward.",
"TIP: Separate conceptual mistakes from careless mistakes. They require different solutions.",
"TIP: Review NCERT examples, especially in Chemistry. Many questions are inspired by them.",
"TIP: When revising a chapter, start with PYQs before opening notes.",
"TIP: Create a list called 'Questions I Never Want To Miss Again.' Review it regularly.",
"TIP: During mocks, circle questions that felt difficult even if you solved them correctly. Those are future weaknesses.",
"TIP: Spend the last 10 minutes of every mock checking marked questions instead of chasing one impossible problem.",
"TIP: Learn shortcut methods only for topics you've already mastered conventionally.",
"TIP: Build chapter confidence through volume. Confidence usually follows solved questions, not motivation.",
"TIP: If you repeatedly forget a concept, create a visual diagram or memory hook for it.",
"TIP: Keep a running list of formulas that have appeared in PYQs. Prioritize those during revision.",
"TIP: Use active recall for every chapter: close your notes and write everything you remember on a blank page.",
"TIP: Every month, identify the chapter contributing the fewest marks and attack it aggressively.",
"TIP: Maintain a 'Last Week Before Exam' notebook. Continuously add only the most important facts and formulas.",
"TIP: The most valuable question in your study material is often the one you got wrong twice.",
"TIP: If you only have 30 minutes, solve questions. Questions expose weaknesses faster than any other activity.","TIP: Before starting a chapter, spend 10 minutes looking at PYQs from that chapter. You'll instantly know what actually matters.",
"TIP: Maintain a 'Not Worth Revising' list. Remove low-yield notes and focus only on information that generates marks.",
"TIP: When stuck on a problem, ask: 'What chapter is the examiner expecting me to use here?' Often the answer becomes obvious.",
"TIP: Create a one-line summary for every chapter. If you can't summarize it, you don't understand it deeply enough.",
"TIP: Every 50 questions, calculate your accuracy rate. Accuracy trends reveal preparation quality better than raw scores.",
"TIP: Study one chapter until you can predict the next step in solutions before reading them.",
"TIP: Build a habit of writing assumptions explicitly in Physics. Hidden assumptions cause countless mistakes.",
"TIP: Once a week, solve questions from chapters you haven't touched in over a month. Memory decays faster than you think.",
"TIP: During revision, spend more time on topics you know at 70% than topics you know at 0%. The return on effort is higher.",
"TIP: Learn the standard graphs, curves, and trends from every chapter. JEE loves visual reasoning.",
"TIP: If a concept appears in multiple chapters, connect them in your notes. Integrated understanding survives longer.",
"TIP: Practice starting questions from different points. Not every problem must be solved using the textbook approach.",
"TIP: Whenever you learn a shortcut, ask yourself when it fails. Knowing limitations prevents traps.",
"TIP: Create a list of 'Questions I Solved By Luck.' Revisit them until luck is replaced by understanding.",
"TIP: At the end of each week, identify one habit that wasted the most time and eliminate it.",
"TIP: Don't just memorize exceptions. Understand why they are exceptions. They become easier to recall.",
"TIP: Learn to recognize whether a problem is algebra-heavy, concept-heavy, or observation-heavy within the first 20 seconds.",
"TIP: If a chapter has many formulas, organize them by concept instead of memorizing them randomly.",
"TIP: Before sleeping, mentally review the toughest concept you learned that day. Memory strengthens during sleep.",
"TIP: Use blank sheets during revision instead of highlighted notes. Retrieval beats recognition.",
"TIP: Every month, take one test without any preparation. It reveals your true retained knowledge.",
"TIP: Build a collection of your favorite questions. Great questions teach more than entire chapters.",
"TIP: Learn to identify answer ranges before solving completely. Approximation is a powerful verification tool.",
"TIP: During practice, occasionally solve questions without a calculator even when one is available.",
"TIP: Don't revise chapters equally. Revise chapters in proportion to their weightage and your weakness.",
"TIP: Whenever you make a silly mistake, create a preventive rule instead of simply promising not to repeat it.",
"TIP: Practice reading questions faster without sacrificing comprehension. Reading speed matters more than most students realize.",
"TIP: Turn frequently forgotten reactions, formulas, and facts into flashcards and test yourself randomly.",
"TIP: Create a separate notebook for elegant solutions. Efficient methods save marks under time pressure.",
"TIP: Learn to abandon a wrong approach quickly. Persistence is useful; stubbornness is expensive.",
"TIP: For difficult chapters, create a roadmap of concepts before solving questions.",
"TIP: Revise old chapters while learning new ones. Otherwise, your preparation becomes a leaking bucket.",
"TIP: If you score poorly in a mock, analyze it within 24 hours. Delayed analysis loses valuable insights.",
"TIP: Build a chapter hierarchy: Strong, Medium, Weak. Study plans become much clearer.",
"TIP: Occasionally solve easy questions as fast as possible. Speed training matters too.",
"TIP: Train yourself to spot symmetry, patterns, and invariants. They unlock many advanced problems.",
"TIP: Learn which formulas are derived often and which formulas are applied often. Prioritize accordingly.",
"TIP: Practice recovering from mistakes. One bad question should not ruin the next five.",
"TIP: Don't chase completion. Chase competence.",
"TIP: Before opening notes, write down everything you remember about a chapter from memory.",
"TIP: If a chapter feels confusing, create a concept map linking all major ideas together.",
"TIP: Compare multiple solutions to the same difficult question. Flexibility is a sign of mastery.",
"TIP: Build endurance by solving long question sets without checking answers in between.",
"TIP: Learn common approximation techniques. They often reveal the correct option immediately.",
"TIP: Review solved questions by covering the solution and predicting the next step.",
"TIP: If your speed is good but accuracy is poor, slow down. If accuracy is good but speed is poor, speed up. Diagnose correctly.",
"TIP: Learn the art of verification. Many marks are saved by checking answers, not solving faster.",
"TIP: Create a personal ranking of chapters by confidence level and update it monthly.",
"TIP: The best revision session starts with a blank page, not an open notebook.",
"TIP: Ask after every question: 'What lesson does this problem teach that the next one might test again?'",
"FACT: If you improve by just 1 mark every 2 days, you'll be 100 marks stronger after 200 days.",
"DATA: Solving 60 questions daily for 200 days results in 12,000 questions attempted before JEE.",
"FACT: Most students dramatically underestimate what 1,000 focused study hours can achieve.",
"FACT: A student studying 6 focused hours daily for 200 days accumulates 1,200 hours of preparation.",
"PREDICTION: The chapter you're avoiding today will look surprisingly easy after 30 consecutive days of effort.",
"FACT: Thousands of students every year score far above what their teachers predicted six months earlier.",
"DATA: Just 20 pages revised daily becomes over 4,000 pages revised across 200 days.",
"FACT: Most 'gifted' students lose to disciplined students over long preparation periods.",
"FACT: The difference between confidence and anxiety on exam day is usually preparation, not personality.",
"TIP: Every question solved today is one less question capable of surprising you in the exam.",
"FACT: Students often quit right before their improvement curve starts accelerating.",
"DATA: A student who wastes 1 hour daily loses over 8 full days of study time across 200 days.",
"FACT: One productive Sunday every week creates nearly a month of additional study time over a year.",
"PREDICTION: Your future self will consider today's difficulties embarrassingly easy.",
"FACT: Most rank improvements happen gradually and then appear suddenly.",
"DATA: Revising a chapter 5 times usually produces more marks than studying 5 new chapters once.",
"FACT: You don't need to beat the entire competition today. You only need to become slightly better than yesterday.",
"FACT: Every topper has experienced periods where they felt behind schedule.",
"PREDICTION: The questions that currently scare you most will eventually become warm-up problems.",
"FACT: Confidence grows from evidence. Every solved question becomes evidence.",
"DATA: Improving accuracy from 70% to 85% can add dozens of marks without learning a single new chapter.",
"FACT: Most students know more than they think and revise less than they should.",
"FACT: The exam rewards consistency far more than occasional bursts of motivation.",
"TIP: If you feel overwhelmed, focus on the next question instead of the entire syllabus.",
"FACT: Small improvements repeated hundreds of times become massive advantages.",
"DATA: Reading theory for 3 hours feels productive. Solving questions for 3 hours usually is productive.",
"FACT: Nearly every difficult chapter becomes manageable after enough exposure.",
"PREDICTION: The effort you're making today will feel completely worth it on result day.",
"FACT: The syllabus is finite. Human determination is often larger than students realize.",
"FACT: One good week cannot save a bad year, but one bad week cannot ruin a good year.",
"DATA: Solving just 10 extra questions daily creates 2,000 additional questions over 200 days.",
"FACT: Most regrets come from opportunities ignored, not challenges attempted.",
"FACT: The brain adapts to difficulty remarkably quickly when challenged consistently.",
"PREDICTION: If you remain consistent for 100 days, people will start noticing. If you remain consistent for 200 days, results will notice.",
"FACT: Every expert was once confused by the same concepts beginners struggle with.",
"FACT: Students often mistake temporary confusion for inability.",
"DATA: An extra 30 minutes daily becomes 100 additional study hours across 200 days.",
"FACT: Progress is usually invisible for weeks and obvious in hindsight.",
"FACT: JEE preparation is often won by those who remain patient longer than everyone else.",
"PREDICTION: Six months from now, you will either be grateful for today's effort or wishing you had started today.",
"FACT: Many students waste more energy worrying about preparation than actually preparing.",
"DATA: Reducing daily distractions by just 20 minutes saves nearly 67 hours in 200 days.",
"FACT: Knowledge compounds. Every chapter mastered makes future chapters easier.",
"FACT: The hardest part of studying is often starting, not continuing.",
"PREDICTION: Your biggest breakthrough will probably arrive after a period of frustration.",
"FACT: Improvement rarely feels dramatic while it's happening.",
"TIP: Don't count chapters completed. Count concepts mastered.",
"FACT: Most students are capable of much higher scores than their current mock results suggest.",
"DATA: Solving 5 PYQs daily results in 1,000 PYQs completed across 200 days.",
"FACT: The student who keeps showing up eventually becomes dangerous.",
"FACT: Consistency creates confidence. Confidence improves performance. Performance strengthens consistency.",
"PREDICTION: One day you'll solve questions in minutes that currently take you an hour.",
"FACT: Nobody remembers your bad mock scores after the final result arrives.",
"DATA: 7 hours daily for 180 days equals over 1,250 study hours.",
"FACT: Hard work doesn't guarantee success, but lack of hard work guarantees limitations.",
"FACT: Most students quit because progress is slower than expected, not because progress is absent.",
"PREDICTION: If you keep improving, your current score will eventually become your warm-up score.",
"FACT: Every solved mock test reduces uncertainty about the real exam.",
"FACT: Students often discover their true potential much later than expected.",
"DATA: Reviewing one mistake carefully can prevent dozens of future mistakes.",
"FACT: A chapter understood deeply is worth more than several chapters memorized superficially.",
"FACT: The gap between where you are and where you want to be is crossed one study session at a time.",
"PREDICTION: The discipline you're building now will help you long after JEE ends.",
"FACT: Most success stories sound obvious only after they happen.",
"DATA: If you improve your score by just 0.5 marks daily, you'll gain 100 marks in 200 days.",
"FACT: The majority of preparation happens when nobody is watching.",
"FACT: Temporary failure is feedback. Permanent failure is quitting.",
"PREDICTION: Many students currently ahead of you will eventually slow down. Keep moving.",
"FACT: You don't need perfect preparation. You need better preparation than most competitors.",
"DATA: Completing one chapter every 3 days allows more than 60 chapters to be covered in 200 days.",
"FACT: Consistent effort creates opportunities that luck alone never can.",
"FACT: Most students overestimate what they can do in a day and underestimate what they can do in six months.",
"PREDICTION: If you stay disciplined long enough, results become inevitable.",
"FACT: Every day you study becomes part of your advantage on exam day.",
"FACT: Momentum is real. Productive days make future productive days easier.",
"DATA: Eliminating just one recurring mistake can save more marks than learning an entire new shortcut.",
"FACT: The student who survives difficult phases often outperforms the student who never faced them.",
"PREDICTION: Future you will wish you had trusted the process sooner.",
"FACT: The exam is temporary. The habits you build preparing for it can last a lifetime.",
"FACT: There are students who started weaker than you and succeeded. There are students who started stronger and failed.",
"FACT: Every hour invested today is a vote for the future you want.",
"PREDICTION: One ordinary study session today could become part of an extraordinary result months later.",
"FACT: The best comeback stories begin when someone decides that today matters."
];

console.log("Loaded " + QUOTES.length + " motivational quotes.");
let intervalId = null;
let quoteIntervalId = null;


export async function initCountdown(container) {
  if (intervalId) clearInterval(intervalId);
  if (quoteIntervalId) clearInterval(quoteIntervalId);

  const data = await getStorage(['testSchedule']);
  dynamicTestSchedule = data.testSchedule ? data.testSchedule : defaultSchedule.map(t => ({
    name: t.name,
    date: t.date.toISOString(),
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5)
  }));

  // Listen for storage changes so the countdown updates if we add/delete a test
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.testSchedule) {
      dynamicTestSchedule = changes.testSchedule.newValue || [];
    }
  });

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "countdown-wrapper";

  const title = document.createElement("h2");
  title.textContent = "JEE Mains Countdown";
  wrapper.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "countdown-grid";

  const units = ["Days", "Hours", "Minutes", "Seconds"];
  const boxes = {};
  units.forEach((unit) => {
    const box = document.createElement("div");
    box.className = "countdown-box";
    const num = document.createElement("span");
    num.className = "countdown-num";
    num.textContent = "00";
    const label = document.createElement("span");
    label.className = "countdown-label";
    label.textContent = unit;
    box.appendChild(num);
    box.appendChild(label);
    grid.appendChild(box);
    boxes[unit] = num;
  });
  wrapper.appendChild(grid);

  const ringContainer = document.createElement("div");
  ringContainer.className = "progress-ring-container";
  const svgSize = 160;
  const strokeWidth = 10;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgSize);
  svg.setAttribute("height", svgSize);
  svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);

  const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  bgCircle.setAttribute("cx", svgSize / 2);
  bgCircle.setAttribute("cy", svgSize / 2);
  bgCircle.setAttribute("r", radius);
  bgCircle.setAttribute("fill", "none");
  bgCircle.setAttribute("stroke", "var(--bg-primary, #2a2a3d)");
  bgCircle.setAttribute("stroke-width", strokeWidth);
  svg.appendChild(bgCircle);

  const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  progressCircle.setAttribute("cx", svgSize / 2);
  progressCircle.setAttribute("cy", svgSize / 2);
  progressCircle.setAttribute("r", radius);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke", "var(--accent, #7c5cfc)");
  progressCircle.setAttribute("stroke-width", strokeWidth);
  progressCircle.setAttribute("stroke-linecap", "round");
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", circumference);
  progressCircle.setAttribute("transform", `rotate(-90 ${svgSize / 2} ${svgSize / 2})`);
  svg.appendChild(progressCircle);

  const pctText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pctText.setAttribute("x", svgSize / 2);
  pctText.setAttribute("y", svgSize / 2);
  pctText.setAttribute("text-anchor", "middle");
  pctText.setAttribute("dominant-baseline", "central");
  pctText.setAttribute("fill", "var(--text-primary, #e0e0e0)");
  pctText.setAttribute("font-size", "22");
  pctText.setAttribute("font-weight", "700");
  pctText.textContent = "0%";
  svg.appendChild(pctText);

  ringContainer.appendChild(svg);
  const ringLabel = document.createElement("div");
  ringLabel.className = "ring-label";
  ringLabel.textContent = "Time Elapsed";
  ringContainer.appendChild(ringLabel);
  wrapper.appendChild(ringContainer);

  const quoteEl = document.createElement("div");
  quoteEl.className = "motivational-quote";
  let quoteIndex = Math.floor(Math.random() * QUOTES.length);
  quoteEl.textContent = `"${QUOTES[quoteIndex]}"`;
  wrapper.appendChild(quoteEl);



  container.appendChild(wrapper);

  function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      boxes["Days"].textContent = "0";
      boxes["Hours"].textContent = "0";
      boxes["Minutes"].textContent = "0";
      boxes["Seconds"].textContent = "0";
      progressCircle.setAttribute("stroke-dashoffset", "0");
      pctText.textContent = "100%";
      clearInterval(intervalId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    boxes["Days"].textContent = days;
    boxes["Hours"].textContent = String(hours).padStart(2, "0");
    boxes["Minutes"].textContent = String(minutes).padStart(2, "0");
    boxes["Seconds"].textContent = String(seconds).padStart(2, "0");

    const totalDuration = TARGET_DATE - START_DATE;
    const elapsed = now - START_DATE;
    const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const offset = circumference - (pct / 100) * circumference;
    progressCircle.setAttribute("stroke-dashoffset", offset);
    pctText.textContent = `${Math.round(pct)}%`;
  }

  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);

  quoteEl.style.transition = "opacity 0.5s ease";
  quoteIntervalId = setInterval(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === quoteIndex);
    quoteIndex = newIndex;
    quoteEl.style.opacity = "0";
    setTimeout(() => {
      quoteEl.textContent = `"${QUOTES[quoteIndex]}"`;
      quoteEl.style.opacity = "1";
    }, 500);
  }, 10000);
}


