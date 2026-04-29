// Usage: node src/backend/scripts/seed_articles.js <admin_email>
// Seeds 5 published articles per category (9 categories = 45 articles total).
// Safe to re-run — skips categories that already have 5+ published articles.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { query } = require('../db');

const ARTICLES = [
  // ── ANXIETY ──────────────────────────────────────────────────────────────
  {
    category: 'anxiety',
    title: 'Understanding Anxiety: What Happens in Your Body',
    estimated_read_minutes: 4,
    tags: ['anxiety', 'nervous system', 'stress response'],
    content: `Anxiety is your body's natural alarm system — the "fight-or-flight" response that evolved to protect you from danger. When you perceive a threat, your brain's amygdala fires a signal that floods your body with adrenaline and cortisol. Your heart rate increases, breathing quickens, and muscles tense — all preparing you to run or fight.

The problem is that this system doesn't distinguish between a lion and a work presentation. Modern stressors trigger the same ancient response.

**Common physical symptoms:**
- Rapid heartbeat or palpitations
- Shortness of breath or feeling like you can't get enough air
- Muscle tension, especially in the shoulders and jaw
- Stomach upset or "butterflies"
- Sweating, trembling, or feeling dizzy

**Why it persists:** Anxiety becomes a cycle. You feel anxious → you avoid the thing → short-term relief → the thing grows bigger in your mind → more anxiety. Understanding this cycle is the first step to breaking it.

The good news: your nervous system has a built-in off switch — the parasympathetic (rest-and-digest) system. Slow, deep breathing directly activates it. This is why breathing exercises aren't just relaxation tips — they're physiology.`,
  },
  {
    category: 'anxiety',
    title: 'Grounding Techniques for Anxiety Spikes',
    estimated_read_minutes: 3,
    tags: ['anxiety', 'grounding', 'coping skills'],
    content: `When anxiety spikes suddenly — a panic attack, overwhelming worry, or a flood of "what ifs" — grounding techniques bring you back to the present moment. They work by engaging your senses and shifting your brain's focus from internal anxious thoughts to the external world.

**The 5-4-3-2-1 Technique:**
Notice 5 things you can see, 4 things you can physically touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste. Move slowly through each sense.

**Cold water:** Hold ice cubes, splash cold water on your face, or drink something cold. The physical sensation disrupts the anxiety cycle.

**Feet on the floor:** Press your feet firmly into the floor. Notice the texture, the pressure, the temperature. Say silently: "I am here. I am safe. This feeling will pass."

**Box breathing:** Breathe in for 4 counts → hold for 4 → breathe out for 4 → hold for 4. Repeat 4 times. This directly calms your nervous system.

**Name it:** Say (silently or aloud) "This is anxiety. It is uncomfortable but not dangerous. It will pass." Naming the experience activates your prefrontal cortex and reduces amygdala activity.

Grounding doesn't make anxiety disappear immediately — it prevents it from escalating and gives you space to breathe.`,
  },
  {
    category: 'anxiety',
    title: 'How to Challenge Anxious Thoughts',
    estimated_read_minutes: 5,
    tags: ['anxiety', 'CBT', 'thought patterns', 'cognitive restructuring'],
    content: `Anxious thoughts feel true. But feeling true and being true are different things. Cognitive restructuring — the core skill of Cognitive Behavioural Therapy (CBT) — teaches you to examine your thoughts like a scientist, not a prosecutor.

**Step 1: Catch the thought**
What exactly are you telling yourself? "I'm going to fail." "Everyone will judge me." "Something bad is going to happen." Write it down.

**Step 2: Identify the distortion**
Common anxiety distortions include:
- *Catastrophising:* Assuming the worst possible outcome
- *Mind reading:* Assuming you know what others think
- *Fortune telling:* Predicting the future as certain
- *All-or-nothing thinking:* If it's not perfect, it's a failure

**Step 3: Gather the evidence**
What facts support this thought? What facts contradict it? What would you tell a friend who had this thought?

**Step 4: Build a balanced thought**
Not a forced positive thought — a realistic one. "I might not nail every part of this presentation, but I'm prepared and capable. Most presentations go better than I expect."

**Step 5: Practise**
This skill takes time. The first hundred times feel awkward. Keep going. You're rewiring neural pathways, and that doesn't happen overnight.`,
  },
  {
    category: 'anxiety',
    title: 'Social Anxiety: It\'s Not Shyness',
    estimated_read_minutes: 4,
    tags: ['anxiety', 'social anxiety', 'mental health'],
    content: `Social anxiety is one of the most common mental health challenges — and one of the most misunderstood. It's not introversion. It's not shyness. And it's definitely not something to "just get over."

Social anxiety involves intense fear of social situations where you might be observed, judged, embarrassed, or humiliated. The fear is disproportionate to the actual risk — you know that, rationally. But knowing doesn't make it stop.

**What it feels like:**
- Dreading situations days or weeks in advance
- Physical symptoms in social situations (blushing, sweating, trembling, going blank)
- Replaying conversations afterward, convinced you said something wrong
- Avoiding situations that trigger the fear — which makes the fear grow

**What helps:**
*Gradual exposure* — slowly approaching feared situations rather than avoiding them. Start small (making eye contact, saying hello), work up gradually.

*Self-compassion* — the inner critic in social anxiety is brutal. Would you speak to a friend the way you speak to yourself after an awkward interaction? Practise responding to yourself with the same kindness.

*Realistic expectations* — not every interaction needs to go perfectly. Awkward moments happen to everyone. They're survivable, not catastrophic.

If social anxiety significantly impacts your life, talking to a mental health professional can help. Effective treatments (CBT, exposure therapy) exist and work.`,
  },
  {
    category: 'anxiety',
    title: 'When Worry Becomes a Problem',
    estimated_read_minutes: 3,
    tags: ['anxiety', 'worry', 'GAD', 'when to seek help'],
    content: `Everyone worries. Worry can even be useful — it motivates preparation, signals real risks, and helps us plan. But when does worry cross into a problem?

**Signs worry has become problematic:**
- You worry for more days than not, about multiple different things
- The worry feels uncontrollable — you want to stop but can't
- It causes significant distress or interferes with daily life (sleep, work, relationships)
- Physical symptoms: restlessness, fatigue, muscle tension, irritability, difficulty concentrating

This pattern — excessive, difficult-to-control worry across multiple life domains — is characteristic of Generalised Anxiety Disorder (GAD), which affects roughly 5% of people at some point in their lives.

**The worry-avoidance trap:** Many people manage anxiety by seeking reassurance ("Is this mole okay?" → get reassurance → brief relief → new worry), avoiding triggers, or over-preparing. These strategies work short-term but maintain anxiety long-term.

**What actually helps:**
- *Scheduled worry time:* 15 minutes daily, write worries down, work on problem-solving. Outside this time, defer worries until tomorrow's session.
- *Distinguishing hypothetical from real problems:* Hypothetical worries ("What if I lose my job?") aren't solvable. Real problems ("I have a difficult performance review tomorrow") can be planned for.
- *Professional support:* If worry is significantly affecting your life, a mental health professional can help. You don't have to live like this.`,
  },

  // ── DEPRESSION ────────────────────────────────────────────────────────────
  {
    category: 'depression',
    title: 'Understanding Depression: Beyond "Feeling Sad"',
    estimated_read_minutes: 4,
    tags: ['depression', 'mental health', 'symptoms'],
    content: `Depression is not sadness. Sadness is a normal, healthy emotion — it comes in response to loss, disappointment, or difficulty, and it lifts. Depression is a medical condition that affects how you think, feel, and function. It can make ordinary things feel impossible.

**Core symptoms (most days, for at least two weeks):**
- Persistent low mood or emptiness — not just sadness, often a flat numbness
- Loss of interest or pleasure in activities you used to enjoy (anhedonia)
- Changes in sleep (too much or too little)
- Changes in appetite and weight
- Fatigue and loss of energy
- Difficulty concentrating, remembering, or making decisions
- Feelings of worthlessness or excessive guilt
- In severe cases: thoughts of death or suicide

**What depression is not:**
It is not weakness. It is not a character flaw. It is not something you can "snap out of" by thinking positively. It involves real changes in brain chemistry and function.

**The cruel irony:** Depression makes you less able to do the things that would help — exercise, socialise, maintain routines. This is the illness, not you. Starting with very small actions — getting out of bed, drinking water, stepping outside for five minutes — is not trivial. In depression, these things are hard-won victories.

If you recognise these symptoms in yourself, please reach out for support. Depression is treatable.`,
  },
  {
    category: 'depression',
    title: 'Behavioural Activation: Doing Things Even When You Don\'t Feel Like It',
    estimated_read_minutes: 5,
    tags: ['depression', 'behavioural activation', 'CBT', 'coping'],
    content: `One of the most effective approaches for depression is counterintuitive: act first, feel later. We tend to think motivation comes before action — "I'll do things when I feel better." In depression, this logic traps you. You wait to feel better. You don't feel better. You do less. You feel worse.

Behavioural Activation (BA) flips this. It's built on evidence that action creates mood change, not the other way around.

**How it works:**
1. *Monitor:* For a few days, track your activities and mood (1-10 scale). Notice the connection — what activities coincide with even slightly higher mood?

2. *Schedule:* Plan specific activities — not "maybe I'll go for a walk" but "I will walk to the end of the street at 10am and come back."

3. *Start tiny:* Depression inflates the effort required for everything. A 5-minute walk is a real victory. Do not compare it to who you were before depression.

4. *Focus on engagement, not enjoyment:* At first you might not enjoy the activity. That's okay. The goal is engagement with life, not immediate pleasure. The enjoyment comes back gradually.

**Activities that evidence suggests help:**
- Physical movement (even gentle — a walk counts)
- Social contact (even low-effort — a text message counts)
- Activities linked to values (what mattered to you before depression?)
- Accomplishment tasks (small to-do items create a sense of capability)

Keep going even when it feels pointless. The feeling of pointlessness is a symptom of the illness, not evidence that the activity won't help.`,
  },
  {
    category: 'depression',
    title: 'Sleep and Depression: The Bidirectional Relationship',
    estimated_read_minutes: 3,
    tags: ['depression', 'sleep', 'sleep hygiene'],
    content: `Sleep and depression have a complicated relationship. Depression disrupts sleep — and disturbed sleep worsens depression. Understanding this cycle can help break it.

**How depression affects sleep:**
- Insomnia: difficulty falling asleep, waking at 3-4am unable to return to sleep
- Hypersomnia: sleeping 10-12 hours and still feeling exhausted
- Unrestorative sleep: sleep that doesn't refresh
- Fragmented sleep: frequent waking, light sleep

**How sleep disruption worsens depression:**
Poor sleep impairs emotional regulation, increases negative thinking, lowers energy and motivation, and reduces the effectiveness of treatments. Sleep is not a passive state — it's when the brain processes emotions and consolidates learning.

**What helps:**
*Consistent timing:* Wake at the same time every day, even weekends, even when you slept poorly. This anchors your circadian rhythm.

*Limit time in bed:* Counterintuitively, spending more time in bed trying to sleep makes insomnia worse. Get up if you can't sleep after 20 minutes.

*Avoid screens before bed:* Blue light and stimulating content delay sleep onset.

*Daylight exposure:* Morning light (even on a cloudy day) helps regulate your body clock. This is particularly important in depression.

*Don't force sleep:* You cannot make yourself sleep. You can only create conditions where sleep becomes possible. Reduce pressure, and sleep is more likely to come.`,
  },
  {
    category: 'depression',
    title: 'Talking to Someone About Depression',
    estimated_read_minutes: 4,
    tags: ['depression', 'help-seeking', 'stigma', 'support'],
    content: `Telling someone you're depressed can feel impossible. The illness itself makes it harder — depression creates shame, isolation, and the belief that you're a burden or that nothing will help anyway. These are symptoms of depression, not facts.

**Who to tell:**
Start with someone you trust — a friend, family member, or anyone you feel safe with. You don't need to tell everyone. One person is enough to start.

**What to say:**
You don't need to explain everything perfectly. "I've not been okay lately and I could use some support" is enough. If it helps, you could say: "I think I might be depressed and I'm finding things really hard."

**What to expect (and manage):**
People who haven't experienced depression sometimes say unhelpful things: "Just think positive," "Everyone gets sad," "Have you tried exercise?" They mean well. You can redirect: "Thanks, it's not quite like that — right now I just need someone to listen."

**Seeking professional help:**
A doctor (GP) is a good first step — they can assess, refer, and discuss treatment options. Therapy (particularly CBT) and medication are both effective treatments for depression, often more effective in combination. Seeking help is not weakness. It is the intelligent response to a medical condition.

**If you're not ready to tell someone in person:**
A crisis line, this app's AI companion, or a peer support group are ways to start. You don't have to manage this alone.`,
  },
  {
    category: 'depression',
    title: 'Self-Compassion When You\'re Struggling',
    estimated_read_minutes: 3,
    tags: ['depression', 'self-compassion', 'inner critic', 'mindfulness'],
    content: `Depression often comes with a brutal inner critic — a voice that says you're lazy, weak, worthless, a burden. Practising self-compassion is not about denying these feelings. It's about relating to yourself with the same basic kindness you'd extend to someone you care about.

**Three components of self-compassion (Kristin Neff):**
1. *Self-kindness:* Treating yourself with warmth rather than harsh judgement when you're struggling
2. *Common humanity:* Recognising that struggle and suffering are part of the shared human experience — not evidence that something is uniquely wrong with you
3. *Mindfulness:* Holding painful feelings in balanced awareness — neither suppressing them nor drowning in them

**A simple practice:**
When you notice self-critical thoughts, ask: "What would I say to a close friend who was going through exactly this?" Then — as best you can — say that to yourself instead.

**Why this matters in depression:**
Research shows self-compassion reduces depression and anxiety, improves resilience, and makes it easier to take helpful actions (like seeking help). The inner critic doesn't motivate positive change — it demoralises. Self-compassion provides a stable, kind foundation from which you can actually recover.

You deserve the same care you would give someone you love. Start there.`,
  },

  // ── OCD ──────────────────────────────────────────────────────────────────
  {
    category: 'ocd',
    title: 'What OCD Actually Is (and Isn\'t)',
    estimated_read_minutes: 4,
    tags: ['OCD', 'obsessions', 'compulsions', 'mental health'],
    content: `"I'm so OCD about my desk being tidy." You've probably heard this. But OCD — Obsessive-Compulsive Disorder — is not a personality quirk or a preference for tidiness. It's a serious mental health condition that can consume hours of a person's day and cause significant distress.

**What OCD involves:**
*Obsessions:* Intrusive, unwanted thoughts, images, or urges that cause distress. They feel different from normal worries — they're often bizarre, repugnant, or terrifying to the person experiencing them. Common themes include harm (fear of hurting someone), contamination (fear of germs or illness), symmetry/order, forbidden thoughts (sexual or religious), and relationships.

*Compulsions:* Repetitive behaviours or mental acts done to reduce the distress caused by obsessions. Checking locks, washing hands, counting, seeking reassurance, mental reviewing. The relief is temporary — the obsession returns, often stronger.

**The OCD cycle:**
Obsession → Anxiety → Compulsion → Temporary relief → Obsession returns. The compulsion is not a solution — it feeds the cycle.

**What OCD is not:**
- A preference for cleanliness (though contamination OCD is real)
- Perfectionism (though OCD and perfectionism can co-occur)
- "Just worrying too much"
- A choice or a character trait

**A crucial point:** The content of obsessions horrifies people with OCD precisely because it's against their values. Intrusive thoughts about harming someone are most common in people who would never harm anyone. The distress is the illness, not evidence of danger.`,
  },
  {
    category: 'ocd',
    title: 'ERP: The Gold Standard Treatment for OCD',
    estimated_read_minutes: 5,
    tags: ['OCD', 'ERP', 'treatment', 'exposure', 'CBT'],
    content: `Exposure and Response Prevention (ERP) is the most effective psychological treatment for OCD. It works by breaking the compulsion cycle — not by eliminating the obsession, but by teaching you that you can tolerate the anxiety without the compulsion, and that the feared outcome doesn't occur.

**How ERP works:**
1. *Build a hierarchy:* List obsession-triggering situations from least to most distressing (rate 0-100).
2. *Exposure:* Deliberately confront the trigger — beginning with lower-rated items.
3. *Response prevention:* Resist the compulsion. Sit with the anxiety without performing the ritual.
4. *Habituation:* With repeated exposure (without compulsion), anxiety naturally decreases. The brain learns: this trigger is not actually dangerous.

**Example:**
Someone with contamination OCD might touch a doorknob (exposure) → resist washing hands for increasing amounts of time (response prevention) → notice anxiety rises, peaks, then falls without the compulsion → repeat until the item no longer triggers significant distress → move to next item on hierarchy.

**Mental compulsions matter too:** ERP applies to mental rituals (reassurance-seeking internally, reviewing past events, counting in your head). The response prevention step must also address these.

**What ERP is not:**
It's not about forcing yourself to feel okay with the feared outcome. It's about learning to tolerate uncertainty — a core skill, since life doesn't come with guarantees.

ERP is most effective when guided by a therapist trained in OCD treatment. It's hard work, but it changes lives.`,
  },
  {
    category: 'ocd',
    title: 'Reassurance-Seeking: Why It Makes OCD Worse',
    estimated_read_minutes: 3,
    tags: ['OCD', 'reassurance', 'compulsions', 'coping'],
    content: `When OCD creates doubt or fear, the natural impulse is to seek reassurance: "Are you sure the door is locked?" "Do you think I'm a bad person?" "Is this normal?" For a moment, reassurance helps. Then the doubt returns — and next time, the need for reassurance is stronger.

Reassurance-seeking is a compulsion. It temporarily lowers anxiety but maintains and feeds the OCD cycle. Over time, you need more reassurance, more often, to get the same brief relief.

**How reassurance-seeking appears in different OCD types:**
- Contamination: "Are you sure this is clean? Are you absolutely sure?"
- Harm OCD: "You'd tell me if I seemed like I could hurt someone, right?"
- Relationship OCD: "Do you really love me? How do you know?"
- Health OCD: Googling symptoms repeatedly, visiting doctors despite normal results

**The role of accommodating family/friends:**
Loved ones often provide reassurance to reduce distress in the moment. This is understandable and well-meaning — and it maintains OCD. Supporting recovery means gently refusing to reassure (agreed upon in advance) and instead supporting the person to sit with uncertainty.

**The goal:**
Tolerating uncertainty. OCD sells certainty as the solution — but certainty is not available. Learning to function in the presence of uncertainty is the real goal. It's harder than getting reassurance, and far more freeing.`,
  },
  {
    category: 'ocd',
    title: 'Intrusive Thoughts: Why Everyone Has Them',
    estimated_read_minutes: 4,
    tags: ['OCD', 'intrusive thoughts', 'mental health', 'normalisation'],
    content: `Research consistently shows that 90%+ of people experience intrusive thoughts — sudden, unwanted mental images or urges, often disturbing. The difference between intrusive thoughts in OCD and in the general population is not the content — it's what happens next.

**For most people:**
A disturbing thought pops up → "Huh, weird thought" → thought passes → move on.

**In OCD:**
A disturbing thought pops up → "Why did I think that? What does it mean about me? What if I act on it? I need to make sure I won't." → anxiety spike → compulsion → brief relief → thought returns more frequently.

The OCD response gives the thought enormous importance, which increases its frequency. A thought you try not to think about becomes harder to stop thinking about (the white bear effect — try not to think about a white bear).

**What this means:**
Intrusive thoughts are not meaningful signals about who you are or what you might do. They are mental noise. Everyone's brain generates them. OCD is the disorder that responds to this noise as though it's signal.

**What helps:**
Not suppressing the thought (that increases it). Not compulsing to neutralise it. Instead: noticing it, acknowledging it without engaging ("There's that thought again"), and continuing with your activity. This is hard. It gets easier.

You are not your thoughts. Having a thought is not the same as having a desire, an intention, or a character flaw.`,
  },
  {
    category: 'ocd',
    title: 'Living with OCD: What Recovery Looks Like',
    estimated_read_minutes: 3,
    tags: ['OCD', 'recovery', 'mental health', 'hope'],
    content: `Recovery from OCD doesn't mean the intrusive thoughts stop. It means the thoughts lose their power — they no longer derail your day, consume your hours, or define your life.

**What recovery looks like:**
- Noticing an obsession without being hijacked by it
- Choosing not to compulse, even though the anxiety is there
- Living your life according to your values, not OCD's rules
- Reduced time spent on rituals
- Increased ability to function in relationships, work, and daily life

**Recovery is not linear:**
Stress, big life changes, and illness can temporarily increase OCD symptoms. This is not failure. It's the nature of a chronic condition. Knowing your triggers and having a plan helps.

**What helps long-term:**
- Continuing to practise ERP, even when OCD is quiet (don't let the skills atrophy)
- Building a life that matters to you beyond OCD management
- Connecting with others who understand (OCD communities can be powerful)
- Being honest with yourself about when you're slipping into compulsions

**Finding treatment:**
IOCDF (International OCD Foundation) has a therapist directory. Look for providers trained in ERP specifically — not all therapists who "treat OCD" use evidence-based methods.

Recovery is possible. People with severe OCD go on to lead full, meaningful lives. The path is hard, but it's there.`,
  },

  // ── ADHD ─────────────────────────────────────────────────────────────────
  {
    category: 'adhd',
    title: 'ADHD: More Than Attention',
    estimated_read_minutes: 4,
    tags: ['ADHD', 'executive function', 'symptoms', 'mental health'],
    content: `ADHD (Attention Deficit Hyperactivity Disorder) is commonly described as a problem with attention — but that's incomplete. People with ADHD can hyperfocus intensely on things that interest them for hours. The issue is a problem with *regulating* attention — directing it where it needs to go, holding it there when needed, and shifting it when appropriate.

**More accurately, ADHD is a disorder of executive function:**
- *Inhibition:* Acting before thinking, interrupting, impulsivity
- *Working memory:* Information falls out of mind mid-task; forgetting what you were just about to do
- *Emotional regulation:* Emotional responses feel bigger, rejection is particularly painful (rejection sensitive dysphoria)
- *Time:* Time feels different — "now" and "not now" rather than a continuous timeline; chronic lateness despite good intentions
- *Activation:* Starting tasks is disproportionately hard, even when you want to do them

**What ADHD is not:**
- Laziness. The ADHD brain requires more effort to do many things that feel automatic to others.
- Just a childhood thing. Most people with ADHD continue to have it in adulthood.
- Caused by bad parenting or too much screen time.

**Three presentations:**
- Predominantly Inattentive (often missed in girls; internal rather than disruptive)
- Predominantly Hyperactive-Impulsive
- Combined (both)

Understanding ADHD is the foundation for building strategies that work with your brain, not against it.`,
  },
  {
    category: 'adhd',
    title: 'ADHD and Time: Practical Strategies',
    estimated_read_minutes: 4,
    tags: ['ADHD', 'time management', 'executive function', 'strategies'],
    content: `For people with ADHD, time often feels less like a line and more like a vague cloud — "now" and "not now." Things that are not happening right now can feel almost abstract, making deadlines, appointments, and future planning genuinely difficult — not because of a character flaw but because of how the ADHD brain processes time.

**What helps:**

*Make time visible:*
- Analogue clocks (where you can see time passing) over digital ones
- Time timers (visual countdown discs)
- Alarms and reminders set earlier than you think necessary

*External structure:*
- Fixed routines for recurring tasks remove the daily decision-making drain
- Body doubling: working in the presence of another person (even virtually) improves focus and follow-through
- Accountability partners: sharing plans with someone who will check in

*The "5 more minutes" rule:*
When a task feels impossible to start, commit to just 5 minutes. Often the brain engages once begun. If not, you've still done 5 minutes.

*Transitional prompts:*
Between activities, the ADHD brain can lose the thread. Calendar alerts 10 minutes before a meeting help. A "before I leave" checklist avoids the forgotten keys, bags, and items.

*Be realistic about task duration:*
People with ADHD systematically underestimate how long tasks take. Try timing yourself doing common tasks for a week to calibrate.

*Self-compassion:* Time blindness is a neurological difference, not a moral failing. Structures compensate for it.`,
  },
  {
    category: 'adhd',
    title: 'Managing Rejection Sensitivity in ADHD',
    estimated_read_minutes: 3,
    tags: ['ADHD', 'rejection sensitivity', 'emotional regulation', 'relationships'],
    content: `Many people with ADHD experience Rejection Sensitive Dysphoria (RSD) — an intense, almost instantaneous emotional pain in response to perceived rejection, criticism, failure, or teasing. The emotional pain can feel extreme — out of proportion to the event — and can be triggered by real or imagined rejection.

**What RSD looks like:**
- Extreme distress when criticised, even mildly or constructively
- Abandoning tasks or hobbies at the first sign of failure
- Intense social anxiety around "getting it wrong" or being seen negatively
- Misreading neutral faces or comments as disapproving
- Masking authentic self to avoid potential disapproval

**Why it happens:**
Research suggests RSD may involve emotional dysregulation at the neurological level — the same dopamine and norepinephrine systems involved in attention also regulate emotional response thresholds.

**What helps:**
*Naming it:* Recognising "this is RSD" in the moment can create a small space between the feeling and the reaction.

*Communication:* Letting trusted people know about RSD so they can frame feedback with care ("This is not a rejection, I want to tell you something helpful about this").

*Checking assumptions:* "Am I reading this correctly? Is there another explanation?" Often there is.

*Therapy:* DBT (Dialectical Behaviour Therapy) skills, particularly distress tolerance and emotional regulation, can help with RSD specifically.

RSD is real. It is not oversensitivity. It is a symptom of ADHD that, with the right tools, can be managed.`,
  },
  {
    category: 'adhd',
    title: 'ADHD and Sleep',
    estimated_read_minutes: 3,
    tags: ['ADHD', 'sleep', 'insomnia', 'circadian rhythm'],
    content: `Sleep problems are extremely common in ADHD — affecting up to 75% of people with the condition. Understanding why can help you find what actually helps.

**Common sleep issues in ADHD:**
- *Difficulty winding down:* The brain keeps going, thoughts racing, unable to switch off
- *Delayed sleep phase:* Natural tendency to fall asleep late and wake late — often in conflict with conventional schedules
- *Restless sleep:* Frequent movement, difficulty staying asleep
- *Morning difficulty:* Waking is particularly hard; transition from sleep to wakefulness is gradual and painful

**Why ADHD and sleep collide:**
The same dopamine and norepinephrine regulation involved in ADHD also affects sleep-wake cycles. Additionally, stimulant medication (if used) can affect sleep timing if taken too late in the day.

**What helps:**

*Consistent wake time:* The anchor for your circadian rhythm. Even if you slept late, wake at the same time.

*Wind-down routine:* 30-60 minutes of low-stimulation activity before sleep (no screens, no intense content). The ADHD brain may resist this — build the routine gradually.

*Stimulus control:* Bed for sleep only. Reduce work, screens, and intense conversation in the bedroom.

*Cool, dark environment:* Physical environment matters.

*Melatonin:* Some people with ADHD benefit from low-dose melatonin to shift sleep timing. Discuss with a doctor.

*Medication timing:* If you take stimulants, discuss timing with your prescriber — too late in the day can delay sleep significantly.

Protecting sleep protects your ability to function, regulate emotions, and manage ADHD symptoms through the day.`,
  },
  {
    category: 'adhd',
    title: 'ADHD Strengths: What the Textbooks Miss',
    estimated_read_minutes: 3,
    tags: ['ADHD', 'strengths', 'neurodiversity', 'identity'],
    content: `ADHD literature often reads like a list of deficits. Understanding the challenges is important — but the full picture includes traits that, in the right environments, are genuine strengths.

**Common ADHD strengths:**
*Hyperfocus:* When engaged by something that captures interest, people with ADHD can concentrate with remarkable depth and sustained energy. This can be a superpower in the right domain.

*Creative thinking:* The ADHD brain makes unusual associations, sees patterns others miss, and generates ideas rapidly. Many people with ADHD are highly creative.

*High energy:* When directed toward meaningful work, the ADHD drive can be exceptional.

*Crisis performance:* Many people with ADHD describe doing their best work under pressure, when the urgency creates the stimulation the brain needs.

*Empathy:* Emotional intensity in ADHD can include deep empathy and genuine care for others.

*Resilience:* Having navigated a world not designed for your brain builds real resilience and problem-solving skills.

**An important nuance:**
Identifying strengths doesn't mean dismissing real challenges. ADHD is a disability in many contexts. Celebrating strengths is about building an accurate self-understanding — not toxic positivity that ignores support needs.

**Finding your environment:**
ADHD traits often become assets in the right environment. Many people with ADHD thrive in roles involving creativity, variety, autonomy, and quick thinking. Finding contexts that fit your brain is part of building a good life.

You contain more than your diagnosis.`,
  },

  // ── GRIEF ─────────────────────────────────────────────────────────────────
  {
    category: 'grief',
    title: 'Understanding Grief: Beyond the Five Stages',
    estimated_read_minutes: 4,
    tags: ['grief', 'loss', 'bereavement', 'Kübler-Ross'],
    content: `The "five stages of grief" (denial, anger, bargaining, depression, acceptance) are widely known — and widely misunderstood. Kübler-Ross originally described these stages in people facing their own death, not bereavement. They were never intended as a linear, universal map of grief.

**What grief actually looks like:**
Grief is not a process with predictable stages and an endpoint. It's more like waves — sometimes overwhelming, sometimes barely perceptible, sometimes arriving unexpectedly years after a loss. Grief does not have a timetable.

**What grief includes:**
- Emotional responses: sadness, anger, guilt, relief, numbness, confusion, and sometimes all of these within an hour
- Physical responses: exhaustion, changes in appetite, sleep disruption, physical aches
- Cognitive effects: difficulty concentrating, forgetting things, a feeling of unreality
- Social effects: withdrawing, or needing more connection than usual

**Types of loss people grieve:**
Death of a loved one, but also: relationship endings, miscarriage, job loss, health changes, the loss of a future that won't happen. Grief is not proportional to the "size" of the loss as others see it.

**What is normal:**
A very wide range of responses is normal. Grieving in your own way, on your own timeline, is normal. Not fitting the expected script of grief is normal.

**What to watch for:**
Prolonged grief (sometimes called complicated grief) — when grief significantly impairs daily functioning for more than a year — may benefit from professional support.`,
  },
  {
    category: 'grief',
    title: 'Continuing Bonds: Staying Connected After Loss',
    estimated_read_minutes: 3,
    tags: ['grief', 'bereavement', 'relationships', 'meaning'],
    content: `Traditional models of grief emphasised "letting go" — detaching from the deceased, accepting the loss, and moving on. More recent research challenges this. The "continuing bonds" framework recognises that maintaining an ongoing internal relationship with the person who died is healthy, not pathological.

**What continuing bonds can look like:**
- Talking to the person who died — internally or aloud
- Consulting them when making decisions ("What would mum think of this?")
- Feeling their presence at significant moments
- Keeping meaningful objects or rituals connected to them
- Feeling that they are part of who you are and continue to shape you

**Why this matters:**
Telling a grieving person to "let go" and "move on" can be harmful — it implies there's something wrong with maintaining a connection. In reality, the task of grief is not to sever the relationship but to transform it: from physical presence to internal presence, from an active to a continuing relationship.

**Finding meaning:**
Many people find that part of grief is finding ways to carry the relationship forward — living in ways the person valued, continuing their work, telling their stories. This doesn't require that the person is present. Their influence continues.

**This doesn't mean not grieving:**
Continuing bonds coexist with grief, not instead of it. You can hold the sadness of absence and the ongoing presence simultaneously. Both are real.`,
  },
  {
    category: 'grief',
    title: 'Supporting Someone Who Is Grieving',
    estimated_read_minutes: 3,
    tags: ['grief', 'support', 'relationships', 'communication'],
    content: `Watching someone grieve is painful and can feel impossible to navigate. Many people say nothing because they fear saying the wrong thing — and some people do say the wrong thing. A few principles can help.

**What genuinely helps:**
*Show up:* Presence matters more than words. Being there, sitting with someone in their grief, doing small practical things (bringing food, offering to be with them) — these are the things people remember.

*Acknowledge the loss directly:* "I'm so sorry about [name]" is better than vague "I heard about your difficult time." Name the person, name the loss.

*Ask rather than assume:* "What would be most helpful right now?" People need different things — some need to talk, some need distraction, some need practical help.

*Follow their lead on talking:* Let them bring up the person. Don't steer away from the topic — many grieving people are relieved to talk about the person they lost.

*Check in over time:* The weeks and months after a loss can be lonelier than the immediate aftermath. Grief doesn't end. Regular check-ins matter.

**What to avoid:**
- "They're in a better place" — may be meant kindly, but can feel dismissive
- "At least..." — silver linings minimise the loss
- "You need to stay strong" — pressure to suppress grief
- "I know exactly how you feel" — you don't; grief is specific
- Sharing your own grief first — this conversation is about them

**The simplest thing:**
"I love you and I'm here." And then being there.`,
  },
  {
    category: 'grief',
    title: 'Grief and the Body',
    estimated_read_minutes: 3,
    tags: ['grief', 'physical health', 'somatic', 'self-care'],
    content: `Grief is not only emotional. It is one of the most physically demanding experiences a person can have. Understanding the body's role in grief can help you care for yourself more effectively.

**Physical effects of grief:**
- *Immune system:* Acute grief suppresses immune function. You may be more susceptible to illness.
- *Cardiovascular:* "Broken heart syndrome" is real — grief can cause acute stress cardiomyopathy in vulnerable people. The risk of heart attack increases significantly in the days following a loss.
- *Sleep disruption:* Insomnia, nightmares, waking in the night are common.
- *Appetite:* Loss of appetite, or the opposite — using food to cope.
- *Physical pain:* Many people experience physical aches with no obvious physical cause. The mind-body connection is real.
- *Fatigue:* Grief is exhausting. Basic tasks require far more energy.

**Why physical self-care matters in grief:**
Not because you "should" maintain wellness routines, but because a body that is depleted makes emotional processing harder. Small things matter: drinking water, eating when you can manage it, sleeping, moving your body gently.

**Somatic approaches to grief:**
Some people find that grief lives in the body — tight throat, heavy chest, clenched jaw. Gentle body-based practices (walking, yoga, gentle stretching, breathwork) can create space for processing that's different from talking.

**Give yourself grace:**
You are not failing at grief because you're exhausted and physically unwell. You are experiencing grief. The body needs care alongside the heart.`,
  },
  {
    category: 'grief',
    title: 'Grief After Suicide Loss',
    estimated_read_minutes: 4,
    tags: ['grief', 'suicide loss', 'bereavement', 'survivor'],
    content: `Losing someone to suicide is a particular kind of grief. It shares much with other bereavement — the loss, the longing, the adjustment — and carries additional dimensions that can make it especially complex.

**What grief after suicide loss often includes:**
*The question "why":* The search for understanding is intense. "Could I have seen the signs?" "Was there something I could have done?" These questions are almost universal and rarely find satisfying answers.

*Guilt:* Even when people know intellectually that they did not cause the death, many feel they could or should have prevented it. This is one of the most painful aspects of suicide loss and is very common.

*Stigma:* Social responses to suicide loss can be less supportive than other forms of bereavement. Some people don't know what to say; some distance themselves.

*Shock and traumatic elements:* Suicide loss often has traumatic dimensions — the manner of death, discovering the body, or the sudden nature of the loss.

*Complicated questions about the relationship:* Reconstructing the relationship in light of the death — understanding the person's pain, feeling confused about anger and love simultaneously.

**What helps:**
- Support from others who have experienced suicide loss (survivor support groups, specific bereavement counselling)
- Being patient with yourself — there is no right way or timeline for this grief
- Finding spaces where you can talk about it openly without managing others' discomfort
- Self-compassion with the guilt — you cannot be responsible for another person's decision in pain

**If you are in pain right now:**
Please reach out to the crisis line. You matter. Your grief is real. Support is available.`,
  },

  // ── LONELINESS ────────────────────────────────────────────────────────────
  {
    category: 'loneliness',
    title: 'Loneliness: Why It Hurts and What It\'s Trying to Tell You',
    estimated_read_minutes: 3,
    tags: ['loneliness', 'connection', 'social health', 'wellbeing'],
    content: `Loneliness is not simply being alone. You can be surrounded by people and feel profoundly lonely. You can be alone and feel deeply connected. Loneliness is the gap between the social connection you have and the social connection you need.

**Why loneliness hurts:**
Evolutionarily, humans are deeply social animals. Isolation from the group was genuinely dangerous for our ancestors. The pain of loneliness is an alarm system — the social equivalent of physical pain — signalling that a need is unmet and motivating reconnection.

**Loneliness and health:**
Chronic loneliness has significant health consequences: it raises cortisol levels, disrupts sleep, impairs immune function, and is associated with shorter lifespan. The WHO has called loneliness a global health concern.

**Types of loneliness:**
- *Social:* Few friends, weak social network
- *Intimate:* Lacking a close confidant or partner
- *Existential:* A sense of fundamental aloneness regardless of social connections

**What loneliness is signalling:**
A need — for connection, belonging, being known, being heard. The feeling is not failure. It is information.

**What doesn't help:**
Passive scrolling through social media is associated with *increased* loneliness. The appearance of connection can make the absence feel sharper.

**What helps:**
Quality over quantity of connections. Consistent, low-pressure contact. Shared activity. Communities around shared interests. And sometimes — working through the barriers that make connection hard.`,
  },
  {
    category: 'loneliness',
    title: 'Building Connection When It Feels Impossible',
    estimated_read_minutes: 4,
    tags: ['loneliness', 'connection', 'social skills', 'practical'],
    content: `Loneliness creates a painful irony: it makes the thing you need (connection) feel harder to reach. Loneliness can increase social anxiety, cause you to interpret neutral social signals negatively, and lead to withdrawal — which increases loneliness.

Breaking this cycle requires small, deliberate steps.

**Start smaller than you think:**
Not "I need to make a best friend." Start with: saying hello to the person who makes your coffee. Commenting on something real in a conversation. Responding to someone's message with more than one word. Small acts of engagement accumulate.

**Be consistent:**
Weak ties (acquaintances, neighbours, colleagues) turn into stronger connections through repeated, low-stakes contact. Consistency matters more than depth in early stages.

**Pursue shared activity:**
Shared experience is one of the most reliable foundations for connection. A class, a group, a volunteer role, a regular community event — these create the repetition and shared context that relationships need to grow.

**Reciprocity:**
Relationships require two-way investment. This means asking questions, being curious about the other person, and being willing to share a little about yourself. Not oversharing in early interactions, but gradually increasing self-disclosure as trust builds.

**The courage requirement:**
Most acts of connection involve some social risk — the possibility of rejection or awkwardness. This risk doesn't go away. But building the capacity to tolerate it, and taking actions anyway, is what connection requires.

**Professional support:**
If loneliness is deep and long-standing, or if social anxiety is a significant barrier, therapy can help. You don't have to solve this alone.`,
  },
  {
    category: 'loneliness',
    title: 'Online Community: Connection and Its Limits',
    estimated_read_minutes: 3,
    tags: ['loneliness', 'online connection', 'social media', 'community'],
    content: `The rise of online communities has given many people — particularly those who are geographically isolated, disabled, neurodivergent, or part of minority groups — access to community they couldn't otherwise find. This is genuinely meaningful.

**When online connection helps:**
- Finding community around specific identities, interests, or experiences
- Maintaining relationships across distance
- Lower-barrier entry point for those with social anxiety
- Access to support when in-person options are limited

**The research, however, shows nuance:**
Passive social media use (scrolling, observing, comparing) is associated with increased loneliness and worse wellbeing. Active use (participating, messaging, creating) tends to be neutral to beneficial.

The type of online interaction matters too. Gaming with friends, regular voice calls, communities with genuine reciprocal engagement — these are qualitatively different from mass media platforms.

**What online connection typically can't replace:**
Physical presence — touch, co-regulation, shared physical experience — has a neurological component that text and video can't replicate. Research on loneliness suggests that in-person connection (even low-quality) has health effects that online connection doesn't fully match.

**A balanced view:**
Online community can be real, meaningful, and life-sustaining for many people. It can also be a way to avoid the vulnerability of in-person connection. Noticing which it is for you, honestly, is valuable.

Use online connection as a bridge, a supplement, and when necessary — a lifeline. But where in-person connection is possible, prioritise it.`,
  },
  {
    category: 'loneliness',
    title: 'Loneliness in Specific Life Stages',
    estimated_read_minutes: 4,
    tags: ['loneliness', 'life transitions', 'young adults', 'parenthood', 'older adults'],
    content: `Loneliness is not equally distributed across life. Certain stages and transitions create particular vulnerability.

**Young adulthood (18–25):**
High rates of loneliness — leaving school removes ready-made social structures; work isn't always friendship-rich; relationships are often unstable; comparison via social media is constant. The gap between expected social life and reality can be acute.

**New parenthood:**
Isolation is extremely common for new parents. Sleep deprivation, loss of pre-parent identity, reduced time for friendships, the intensity of caring for a dependent — all contribute. Partners may feel disconnected from each other. This is normal and often temporary.

**Midlife:**
Career, caregiving for children and/or ageing parents, relationship strain — midlife can be busy in ways that hollow out friendship. Friendships often become shallower or fade without the shared structure of school or early adult life.

**Later life:**
Loss of peers and partner, reduced mobility, retirement removing work-based social structure, potential physical health barriers to socialising — older adults are at high risk for chronic loneliness.

**Transitions:** Moving cities, leaving a relationship, changing careers, health changes — any major transition disrupts established social networks and creates temporary (sometimes prolonged) loneliness.

**What helps at any stage:**
Naming the specific barrier ("I've moved and know no one here") is more useful than a general "I'm lonely." Targeted strategies that address the specific barrier, combined with self-compassion about the difficulty of the transition, work better than generic advice.`,
  },
  {
    category: 'loneliness',
    title: 'Self-Relationship: Being Your Own Company',
    estimated_read_minutes: 3,
    tags: ['loneliness', 'self-compassion', 'solitude', 'wellbeing'],
    content: `Loneliness and solitude are different experiences. Solitude — time alone chosen and valued — can be restorative, creative, and deeply satisfying. Loneliness is unwanted aloneness, a painful absence of connection. Developing a better relationship with yourself can shift the experience of alone time.

**Why the relationship with yourself matters:**
If you are uncomfortable or critical in your own company, alone time becomes unbearable. If you can be curious, compassionate, and engaged with yourself, solitude becomes a resource.

**Practices for better self-company:**
*Curiosity about your inner life:* Journaling, reflection, noticing what you feel and think — these deepen self-knowledge and make your inner life richer.

*Self-compassion:* Treating yourself with the warmth you'd extend to a good friend. This changes the quality of inner experience significantly.

*Engaged solitude:* Being alone while doing something absorbing — creating, learning, being in nature, moving — is qualitatively different from lonely inactivity.

*Reducing avoidance:* If you compulsively fill alone time with screens to avoid the discomfort of your own thoughts, you miss the chance to develop comfort in your own company. Sitting with the discomfort, gradually, builds tolerance.

**A realistic note:**
Developing comfort in your own company is valuable — and it's not a substitute for connection. Humans are social animals. The goal isn't to need no one. It's to not be dependent on others for basic okayness, so that you can connect from a more solid place.`,
  },

  // ── STRESS ────────────────────────────────────────────────────────────────
  {
    category: 'stress',
    title: 'The Biology of Stress',
    estimated_read_minutes: 3,
    tags: ['stress', 'cortisol', 'nervous system', 'biology'],
    content: `Stress is a physiological response to perceived demands — it's not inherently bad. Acute stress sharpens focus, increases energy, and improves performance on challenging tasks. The problem is chronic, unrelieved stress.

**The stress response:**
When you perceive a threat or demand, your hypothalamus signals the adrenal glands to release adrenaline and cortisol. Your heart rate and blood pressure increase, your breathing quickens, muscles receive more blood, digestion slows. You are primed for action.

**What stress is meant to do:**
After the threat passes, cortisol levels should return to baseline. Movement helps metabolise stress hormones — our ancestors ran from predators, burning off the adrenaline. We sit in traffic, absorbing it.

**Chronic stress and the body:**
When the stress response stays chronically activated:
- Immune function is suppressed (more infections, slower healing)
- Cardiovascular strain increases
- Sleep is disrupted
- Digestion is impaired
- Brain structures involved in memory and emotion are affected
- Mental health consequences accumulate

**The allostatic load:**
The cumulative wear-and-tear of chronic stress on the body is called allostatic load. It builds over time, particularly in contexts of persistent adversity, and has real long-term health consequences.

Understanding the biology of stress helps contextualise why stress management is not a luxury — it's healthcare.`,
  },
  {
    category: 'stress',
    title: 'Burnout: What It Is and How to Recover',
    estimated_read_minutes: 5,
    tags: ['stress', 'burnout', 'recovery', 'work'],
    content: `Burnout is a state of chronic depletion — physical, emotional, and mental exhaustion from sustained overload. It's not the same as stress. Stress is "too much"; burnout is "nothing left."

**Maslach's three dimensions of burnout:**
1. *Exhaustion:* Persistent fatigue that doesn't improve with rest
2. *Cynicism/Detachment:* Emotional distancing from work, people, or activities you once cared about
3. *Reduced efficacy:* A sense of incompetence or lack of achievement, feeling like nothing you do makes a difference

**What causes burnout:**
Sustained high demands with insufficient recovery. Contributing factors: excessive workload, lack of control, insufficient recognition, poor social climate, unfairness, misalignment of values.

**What burnout is not:**
Weakness. A failure of attitude. Something you can fix with a weekend off.

**How recovery works:**
*It takes longer than you think:* Burnout recovery is typically months, not days. Expect slow progress.

*Rest is necessary but not sufficient:* Rest alone does not cure burnout. You also need to address the causes, reconnect with activities that provide meaning, and gradually rebuild engagement.

*Address the source:* If the conditions creating burnout don't change, the burnout returns. Identifying what specifically needs to change — workload, boundaries, role, relationship — is essential.

*Reconnect with non-work identity:* Burnout often involves over-identification with work. Investing in relationships, hobbies, and activities outside work provides recovery and resilience.

*Professional support:* Burnout is a health issue. A doctor can assess, refer, and if needed, provide a medical certificate for time off. A therapist can help with the psychological dimensions.

You cannot think your way out of burnout. You need to change what you do.`,
  },
  {
    category: 'stress',
    title: 'Setting Limits: The Skill of Saying No',
    estimated_read_minutes: 4,
    tags: ['stress', 'boundaries', 'assertiveness', 'relationships'],
    content: `Many people under chronic stress share a pattern: difficulty declining requests, agreeing to things they don't have capacity for, then feeling resentful and exhausted. Learning to set limits — saying no, negotiating scope, protecting your time — is a core stress management skill.

**Why saying no is hard:**
- Fear of disappointing others
- Belief that your worth depends on being helpful
- Social pressure, especially in some cultural contexts
- Not feeling entitled to your own time and energy

**Reframing:**
Every yes to something is a no to something else. When you say yes to a commitment you don't have capacity for, you are saying no to recovery, to other priorities, to your wellbeing. There is no neutral option.

**How to say no well:**
*Be direct and clear:* "I can't take that on right now" is complete. You don't owe a lengthy explanation.

*Acknowledge the request:* "I appreciate you thinking of me — I'm not able to commit to that."

*Offer an alternative if genuine:* "I can't do this, but [X] might be able to help." Only if you mean it.

*Say it sooner:* The longer you wait, the harder it becomes.

**Setting limits with yourself:**
The most demanding boundary-setter is often internal — the voice that says you should do more, be more, rest less. Challenging this inner voice is part of the work.

**A note on context:**
Limits look different across cultures, relationships, and power dynamics. The goal is not to say no indiscriminately, but to make choices about your time and energy that reflect your actual priorities and capacity.`,
  },
  {
    category: 'stress',
    title: 'Rest as a Practice',
    estimated_read_minutes: 3,
    tags: ['stress', 'rest', 'recovery', 'burnout prevention'],
    content: `In a culture that valorises productivity, rest is often treated as what happens when you've finished work — or as laziness. But rest is not passive. It is active recovery, essential maintenance, and the foundation of sustainable performance.

**Different types of rest (Saundra Dalton-Smith):**
*Physical:* Sleep, naps, gentle movement
*Mental:* Breaks from cognitive demands, unstructured time, nature exposure
*Emotional:* Space to process feelings, time with emotionally safe people, alone time if needed
*Social:* Time away from social demands — some people are depleted rather than restored by socialising
*Sensory:* Reduction of stimulus — screen breaks, quiet, natural environments
*Creative:* Space for unproductive play, curiosity without goal
*Spiritual/Meaning:* Connection to values, purpose, community, transcendence

**Why this matters:**
Sleep alone doesn't meet all rest needs. If you're mentally depleted, sleeping more doesn't help as much as mental downtime. If you're emotionally overwhelmed, social activity may be more depleting than restoring.

**Diagnosing your rest deficit:**
What type of rest do you most lack? Which type, if you got more of it, would make the greatest difference? Start there.

**Rest requires protection:**
Rest doesn't happen automatically in a demanding life. It requires intention, scheduling, and sometimes defending from encroachment. Rest is not earned. It is necessary.`,
  },
  {
    category: 'stress',
    title: 'Stress in the Body: Physical Approaches',
    estimated_read_minutes: 3,
    tags: ['stress', 'exercise', 'breathing', 'body', 'physical health'],
    content: `Stress lives in the body. Cognitive strategies help — but for stress that is physically held, physical approaches are often the most direct route to relief.

**Movement:**
Exercise is one of the most evidence-based stress interventions available. It metabolises stress hormones, increases endorphins, improves sleep, and provides psychological distance from stressors. You don't need intense exercise — a 20-minute walk lowers cortisol. Regularity matters more than intensity.

**Breathing:**
The autonomic nervous system has a fast-access back door: your breath. Slow, extended exhales activate the parasympathetic (rest-and-digest) system directly.

Try: 4 counts in → 6 counts out. Repeat for 2-3 minutes. The extended exhale is key.

**Progressive muscle relaxation:**
Systematically tense and release muscle groups through the body. This directly addresses the muscular tension that chronic stress produces and teaches the body the felt difference between tension and release.

**Touch and warmth:**
Warmth (a hot drink, bath, or shower) and self-touch (crossed hands on chest, hands on face) activate the social safety system and reduce cortisol.

**Nature:**
Time in natural environments reduces cortisol, lowers heart rate and blood pressure, and restores attention. Even brief exposures help. Even urban green spaces. Even indoor plants.

**Sleep:**
All physical stress-reduction is undermined by poor sleep. Sleep is when cortisol resets, emotional memories are processed, and the body repairs. Protecting sleep is protecting everything else.

Start with one physical practice. Make it regular before adding another.`,
  },

  // ── GENERAL_WELLNESS ──────────────────────────────────────────────────────
  {
    category: 'general_wellness',
    title: 'The Five Pillars of Mental Health',
    estimated_read_minutes: 4,
    tags: ['mental health', 'wellbeing', 'lifestyle', 'prevention'],
    content: `Mental health is not simply the absence of mental illness. It's a state of wellbeing in which you can realise your potential, cope with normal stresses of life, work productively, and contribute to your community. It requires active maintenance.

**Five evidence-based pillars:**

*1. Sleep:*
The foundation. Sleep is when the brain consolidates memory, processes emotion, clears waste products, and resets. Chronic poor sleep is one of the most significant risk factors for depression, anxiety, and cognitive decline. Aim for 7-9 hours. Consistent timing matters as much as duration.

*2. Movement:*
Physical activity has consistent, robust evidence for improving mental health — comparable to medication for mild-to-moderate depression. 150 minutes of moderate activity per week is the general guideline. Any movement helps more than none.

*3. Connection:*
Social connection is as important to longevity as not smoking. Quality matters more than quantity. Invest in relationships — they require time and attention to maintain.

*4. Purpose and meaning:*
Having reasons to engage with life — goals, values, roles that matter — provides resilience and motivation. This doesn't require grand purpose. It includes small daily commitments, relationships, and activities aligned with your values.

*5. Managing stress and recovery:*
Life involves demands. Sustainable functioning requires balancing demands with sufficient recovery — sleep, rest, play, downtime. Without recovery, capacity degrades.

These pillars interact. Poor sleep impairs emotional regulation. Isolation increases stress. Meaningful activity supports motivation to exercise. Work on whichever pillar is most depleted — improvements cascade.`,
  },
  {
    category: 'general_wellness',
    title: 'Mindfulness: What It Is and How to Start',
    estimated_read_minutes: 5,
    tags: ['mindfulness', 'meditation', 'stress', 'mental health'],
    content: `Mindfulness is the practice of paying attention to the present moment — to your experience as it is, right now — with curiosity and without judgement. It sounds simple. It isn't easy.

**What mindfulness is not:**
Not emptying your mind. Not relaxation (though it can be relaxing). Not a spiritual practice (though it has roots in Buddhist meditation). Not thinking about nothing.

**What mindfulness is:**
Noticing what's happening — thoughts, sensations, emotions — as they arise, without being swept away by them. You are not your thoughts. You are the awareness that notices thoughts.

**Why it helps:**
Research shows that regular mindfulness practice reduces anxiety, depression, and stress. It improves emotional regulation and reduces reactivity. It does this by strengthening the part of the brain that observes experience without being ruled by it.

**How to start (simple):**
Sit comfortably. Set a timer for 5 minutes. Bring attention to your breath — not trying to change it, just noticing it. When your attention wanders (it will), notice that it has wandered, and gently return. Repeat.

That's it. The "returning" is the practice, not a failure. You'll return thousands of times. Each return is a repetition — like a bicep curl for your attention.

**Building the habit:**
Start with 5 minutes daily, at the same time each day. Use a guided app if helpful. The effects compound over weeks and months, not days.

**Informal mindfulness:**
You can also practise during everyday activities — walking, eating, washing up — by bringing full attention to the activity rather than being mentally elsewhere. This is different from formal practice but valuable.`,
  },
  {
    category: 'general_wellness',
    title: 'The Power of Routine',
    estimated_read_minutes: 3,
    tags: ['routine', 'mental health', 'habits', 'structure'],
    content: `Routine sounds mundane. For mental health, it's foundational. Predictable structure reduces the cognitive and emotional load of daily life, supports biological rhythms, and provides a scaffolding that holds you when motivation and mood fail.

**Why routine matters:**
Every decision costs mental energy. Routine automates decisions you don't need to make consciously — when to sleep, when to eat, when to move — freeing cognitive resources for what actually matters.

Routine also anchors circadian rhythms. Your body has biological clocks regulating sleep, appetite, hormones, and mood — and they function better with consistent timing signals.

**The mental health case:**
Depression, anxiety, and stress all disrupt routine — and disrupted routine worsens all three. Re-establishing routine is often one of the first therapeutic targets in depression.

**Building a useful routine:**
*Morning anchor:* A consistent wake time and a predictable morning sequence (even 15 minutes) starts the day with a sense of agency. Avoid immediately checking your phone.

*Evening wind-down:* 30-60 minutes of consistent, low-stimulation activity before sleep. This is when sleep quality is determined.

*Movement:* Build it in at a regular time, so it becomes default rather than optional.

*Meals:* Regular meal timing stabilises blood sugar and mood.

**Start small:**
A perfect routine that doesn't exist helps nobody. One consistent anchor habit is better than a comprehensive system you maintain for three days and abandon.`,
  },
  {
    category: 'general_wellness',
    title: 'When to Seek Professional Help',
    estimated_read_minutes: 3,
    tags: ['mental health', 'help-seeking', 'therapy', 'when to see a doctor'],
    content: `There's no objective threshold for when to seek professional mental health support — and the common idea that you should only go when things are "bad enough" leads people to wait far too long.

**Consider seeking help when:**
- Emotional distress is interfering with daily functioning (work, relationships, basic self-care)
- Symptoms have persisted for more than two weeks despite your efforts
- You're using substances, overworking, or other avoidance behaviours to cope
- You're having thoughts of self-harm or that life isn't worth living
- You're not sure what's wrong but you know something isn't right
- You've tried self-help strategies and they're not working

**But also:**
You don't need a crisis to seek support. Therapy is also valuable for self-development, navigating transitions, improving relationships, and building resilience. You don't have to be unwell to benefit.

**Types of help:**
*GP/doctor:* A good first step — they can assess, refer, and discuss medication options if relevant.
*Psychologist:* Psychological assessment and therapy.
*Counsellor:* Therapeutic support, particularly for relationship and life issues.
*Psychiatrist:* Medical specialist in mental health — particularly relevant if medication is a consideration.

**Barriers:**
Cost, availability, stigma, and "I should be able to handle this myself" all get in the way. These are real barriers. Naming them is the first step to addressing them. Your mental health is worth the effort of navigating them.`,
  },
  {
    category: 'general_wellness',
    title: 'Emotional Regulation: The Foundation of Mental Health',
    estimated_read_minutes: 4,
    tags: ['emotional regulation', 'mental health', 'DBT', 'coping'],
    content: `Emotional regulation is not about suppressing emotions or always feeling calm. It's about experiencing emotions in ways that don't overwhelm you or drive you to do things you'll regret — and recovering from strong emotions without being derailed.

**What good emotional regulation looks like:**
- Noticing emotions as they arise (rather than suddenly being hijacked by them)
- Tolerating uncomfortable emotions without acting them out impulsively
- Identifying what you're feeling with some precision
- Taking actions consistent with your values, even when emotions are strong
- Returning to baseline after intense emotions without lasting dysregulation

**Why it matters:**
Poor emotional regulation underlies many mental health difficulties — depression, anxiety, relationship problems, substance use, and personality disorders all involve some form of dysregulation.

**Skills for emotional regulation (from DBT):**

*Opposite action:* When an emotion is urging an action that won't help (hiding when anxious, attacking when angry, withdrawing when sad), do the opposite. Don't feel like calling a friend? Call them anyway.

*TIPP:* Temperature (cold water on face), Intense exercise, Paced breathing, Progressive muscle relaxation — fast-acting physiological regulation for intense emotions.

*Check the facts:* Emotions feel like facts. Are they? What's the evidence for and against the thought driving the feeling?

*Emotion labelling:* Research shows that naming emotions reduces their intensity. "I am feeling angry" is different from being engulfed by anger.

Emotional regulation is a skill — it can be learned. It takes practice, especially if you grew up in an environment where emotions weren't well-regulated around you. Be patient with the learning.`,
  },

  // ── CRISIS_SUPPORT ────────────────────────────────────────────────────────
  {
    category: 'crisis_support',
    title: 'Understanding Suicidal Thoughts',
    estimated_read_minutes: 4,
    tags: ['crisis', 'suicidal ideation', 'mental health', 'safety'],
    content: `If you are having thoughts of suicide right now, please reach out immediately. You can call Befrienders Kenya on 0800 723 253 (free, 24/7), or use the Emergency button in this app.

---

Suicidal thoughts are more common than many people realise — and most people who experience them do not go on to attempt suicide. Understanding them can reduce their power.

**Suicidal thoughts are a symptom, not a decision:**
Like physical pain signals a problem in the body, suicidal thoughts usually signal that psychological pain has become unbearable. They are the mind's attempt to solve an impossible problem. "I want the pain to stop" — not necessarily "I want to die."

**The suicidal mind:**
Shneidman described suicide as driven by "psychache" — intense psychological pain — and "perturbation" — a narrowed, constricted thinking state. In this state, the mind loses access to the full range of options. The goal of crisis support is to reduce this constriction and reconnect with possibilities.

**What suicidal thoughts often mean:**
"I am in unbearable pain and I cannot see a way through" — not "I am definitely going to act on this."

**Talking about it:**
Contrary to a common fear, asking someone directly about suicidal thoughts does not plant the idea. It often provides relief — being asked means being seen, and reduces isolation.

**If you're supporting someone:**
Ask directly: "Are you having thoughts of suicide?" Listen without judgment. Take it seriously. Help them access support.

**Recovery is possible:**
The vast majority of people who survive a suicide attempt and receive treatment report they are glad to be alive. The pain that drives suicidal thoughts is real — and it is treatable.`,
  },
  {
    category: 'crisis_support',
    title: 'Creating a Safety Plan',
    estimated_read_minutes: 5,
    tags: ['crisis', 'safety plan', 'self-harm', 'suicide prevention'],
    content: `A safety plan is a personalised, written plan created in advance for moments of crisis — when thinking is constricted and the impulse toward self-harm is strong. Having a plan means you've already made decisions that are hard to make in the middle of a crisis.

**Safety plans work best when created during a calmer period** — not in the middle of a crisis. They are used when crisis occurs.

**Elements of a safety plan:**

*1. Warning signs:*
What signals that a crisis may be building? Thoughts ("I'm a burden"), feelings (numbness, hopelessness), situations (being alone after conflict), behaviours (isolating, drinking more)?

*2. Internal coping strategies:*
Things you can do alone to distract or reduce distress. Activities that have helped before. Things that bring even small moments of relief.

*3. Social distraction:*
People or places that provide positive distraction without needing to discuss the crisis. Being around people can help even if you don't disclose.

*4. People you can talk to:*
Specific trusted people you can reach out to for support. Include their contact details.

*5. Professional and crisis contacts:*
Mental health professional, crisis line (Befrienders Kenya: 0800 723 253), emergency services if needed.

*6. Making your environment safer:*
Reducing access to means during a crisis — asking someone to hold medication, removing or securing items. This reduces impulsive risk.

*7. Reasons to live:*
What matters to you. People, values, experiences, things you want to see or do. Written down for when your mind can't access them.

**Using the plan:**
In a crisis, start at step 1 and work through. Your safety plan is in this app — access it from the Safety Plan section.`,
  },
  {
    category: 'crisis_support',
    title: 'Self-Harm: Understanding and Getting Support',
    estimated_read_minutes: 4,
    tags: ['self-harm', 'crisis', 'coping', 'mental health'],
    content: `If you are currently harming yourself and need immediate help, please use the Emergency button in this app or call Befrienders Kenya on 0800 723 253 (free, 24/7).

---

Self-harm — deliberately hurting yourself, most commonly cutting, burning, or hitting — is not always about wanting to die. For many people, self-harm is a way of managing overwhelming emotional pain: making internal pain visible, feeling something when numb, or releasing tension that has become unbearable.

**Why people self-harm:**
- A way to cope with intense distress when other coping mechanisms feel inadequate
- To feel something when numbness or dissociation is overwhelming
- To punish oneself
- To communicate pain that feels impossible to express in words
- For some, a sense of control when other areas of life feel out of control

**Self-harm is not:**
- Attention-seeking (though it can be a communication of need)
- A "phase" that will pass on its own
- Something to be ashamed of
- A lifestyle or identity

**The cycle:**
Self-harm often provides temporary relief — which is why it continues. But the underlying pain remains, and the self-harm typically becomes harder to stop over time.

**Getting support:**
Self-harm is treatable. Effective approaches (particularly DBT — Dialectical Behaviour Therapy) address the emotional dysregulation that underlies it, and build alternative coping skills.

Talking to a mental health professional is the most important first step. You don't have to manage this alone.

**If you're in crisis right now:**
Please reach out. The Emergency section of this app connects you with support.`,
  },
  {
    category: 'crisis_support',
    title: 'Crisis Lines and Emergency Resources in Kenya',
    estimated_read_minutes: 2,
    tags: ['crisis', 'Kenya', 'emergency', 'resources', 'help'],
    content: `If you are in immediate danger, please call emergency services or use the Emergency button in this app.

---

**Crisis Support:**

**Befrienders Kenya**
- Phone: 0800 723 253
- Free to call, available 24/7
- Emotional support for anyone in distress or experiencing suicidal thoughts
- Confidential

**Mathare Hospital Psychiatric Emergency**
- Hospital providing inpatient psychiatric care
- Located in Nairobi

**Chiromo Hospital Group**
- Private psychiatric hospital with emergency services
- Nairobi

**Kenya Red Cross**
- Phone: 1199

---

**In any emergency:**
Call 999 (Kenya Police Emergency) or go to the nearest hospital emergency department.

---

**This app:**
- Emergency Button: connects you with an admin who will follow up
- Safety Plan: access your pre-prepared plan
- Breathing exercises: grounding tools for moments of distress
- AI Companion: available for support, though not a crisis service
- Peer Support: connect with others for real-time support

**You are not alone.** Help is available. Reaching out is the right thing to do.`,
  },
  {
    category: 'crisis_support',
    title: 'After a Crisis: Recovery and Moving Forward',
    estimated_read_minutes: 4,
    tags: ['crisis', 'recovery', 'after crisis', 'resilience', 'mental health'],
    content: `Coming through a mental health crisis is significant. Whether it was a period of intense suicidal thinking, a breakdown, a hospitalisation, or another crisis point — what comes after matters enormously for your wellbeing and recovery.

**The aftermath of crisis:**
Many people feel a complex mix after a crisis: relief, shame, exhaustion, confusion, and sometimes fear that it could happen again. All of these responses are understandable.

**What recovery after crisis involves:**

*Rest and stabilisation:*
The nervous system needs time to regulate after a crisis. Don't expect to return immediately to pre-crisis functioning. Slow down, prioritise basics (sleep, food, safety).

*Understanding what happened:*
Working with a mental health professional to understand what led to the crisis — the triggers, the warning signs, what helped and what didn't — is valuable for preventing future crises.

*Updating your safety plan:*
After a crisis, your safety plan can be refined with what you've learned. What warning signs did you notice (or miss)? What actually helped in the crisis? What would you do differently?

*Rebuilding gently:*
Return to activities, relationships, and responsibilities gradually. Don't expect to do everything at once.

*Addressing shame:*
Many people feel significant shame after a crisis. Shame thrives in silence. Talking about it — with a trusted person or therapist — reduces its power.

**Peer support:**
Connecting with others who have been through similar experiences can be powerfully validating. You are not the only person who has been here. Others have come through.

**A realistic view:**
Recovery is rarely linear. There may be future difficult periods. Having been through a crisis before means you have information, experience, and (potentially) a better support system for next time. That's not nothing — it's real resilience.`,
  },
];

async function main() {
  const adminEmail = process.argv[2];
  if (!adminEmail) {
    console.error('Usage: node seed_articles.js <admin_email>');
    process.exit(1);
  }

  const { rows: adminRows } = await query(
    'SELECT id FROM users WHERE email = $1 AND role = $2',
    [adminEmail.toLowerCase().trim(), 'admin']
  );
  if (!adminRows.length) {
    console.error('Admin user not found. Run seed_admin.js first.');
    process.exit(1);
  }
  const adminId = adminRows[0].id;

  // Check which categories already have enough articles
  const { rows: countRows } = await query(
    `SELECT category, COUNT(*) AS count FROM psychoeducation_articles
     WHERE status = 'published' GROUP BY category`
  );
  const counts = Object.fromEntries(countRows.map((r) => [r.category, parseInt(r.count)]));

  let created = 0;
  let skipped = 0;

  for (const article of ARTICLES) {
    const existing = counts[article.category] || 0;
    if (existing >= 5) {
      // Still insert if this specific title doesn't exist yet
    }
    const { rows: titleRows } = await query(
      'SELECT 1 FROM psychoeducation_articles WHERE title = $1',
      [article.title]
    );
    if (titleRows.length) {
      console.log(`  skip — already exists: "${article.title}"`);
      skipped++;
      continue;
    }
    await query(
      `INSERT INTO psychoeducation_articles
         (title, category, content, estimated_read_minutes, tags, status, created_by, published_at)
       VALUES ($1, $2, $3, $4, $5, 'published', $6, NOW())`,
      [article.title, article.category, article.content, article.estimated_read_minutes, article.tags, adminId]
    );
    console.log(`  created — [${article.category}] "${article.title}"`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  console.log('\nArticles per category:');
  for (const cat of ['anxiety','depression','ocd','adhd','grief','loneliness','stress','general_wellness','crisis_support']) {
    const { rows } = await query(
      `SELECT COUNT(*) AS count FROM psychoeducation_articles WHERE category = $1 AND status = 'published'`,
      [cat]
    );
    console.log(`  ${cat}: ${rows[0].count}`);
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
