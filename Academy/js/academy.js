// Quantum Academy — Supabase Client
const SUPABASE_URL = 'https://rihlrfiqokqrlmzjjyxj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaGxyZmlxb2txcmxtempqeXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTU2NDYsImV4cCI6MjA4NDA5MTY0Nn0.G2TQKSmQpPYb8Cyzo7R833G7xkr0855faLRjrJ9ov-4';

// Initialize Supabase client
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== AUTH HELPERS ==========

async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getProfile(userId) {
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signUp(email, password, fullName) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = '/academy/';
}

async function resetPassword(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://qp-homepage.netlify.app/academy/reset-password.html'
  });
  if (error) throw error;
}

// ========== COURSE HELPERS ==========

async function getCourses(status = 'published') {
  const { data, error } = await sb.from('qa_courses')
    .select('*')
    .eq('status', status)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

async function getCourse(slug) {
  const { data, error } = await sb.from('qa_courses')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

async function getCourseModules(courseId) {
  const { data, error } = await sb.from('qa_modules')
    .select('*, qa_lessons(*)')
    .eq('course_id', courseId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'qa_lessons' });
  if (error) throw error;
  return data || [];
}

// ========== ENROLLMENT HELPERS ==========

async function getMyEnrollments() {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await sb.from('qa_enrollments')
    .select('*, qa_courses(*)')
    .eq('user_id', user.id)
    .eq('status', 'active');
  if (error) throw error;
  return data || [];
}

async function getEnrollment(courseId) {
  const user = await getUser();
  if (!user) return null;
  const { data } = await sb.from('qa_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single();
  return data;
}

async function enrollFree(courseId) {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  const { data, error } = await sb.from('qa_enrollments').insert({
    user_id: user.id,
    course_id: courseId,
    payment_status: 'completed',
    amount_paid_cents: 0,
    status: 'active'
  }).select().single();
  if (error) throw error;
  return data;
}

// ========== PROGRESS HELPERS ==========

async function getLessonProgress(enrollmentId, courseId) {
  const user = await getUser();
  if (!user) return [];
  const { data, error } = await sb.from('qa_lesson_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('user_id', user.id);
  if (error) throw error;
  return data || [];
}

async function markLessonComplete(lessonId, courseId, enrollmentId) {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  
  const { data, error } = await sb.from('qa_lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    enrollment_id: enrollmentId,
    status: 'completed',
    completed_at: new Date().toISOString(),
    started_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' }).select().single();
  if (error) throw error;
  return data;
}

async function saveVideoPosition(lessonId, courseId, enrollmentId, posSeconds, watchedPercent) {
  const user = await getUser();
  if (!user) return;
  
  await sb.from('qa_lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    enrollment_id: enrollmentId,
    status: 'in_progress',
    video_position_seconds: posSeconds,
    video_watched_percent: watchedPercent,
    started_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' });
}

// ========== BOOKMARK HELPERS ==========

async function toggleBookmark(lessonId, note = '') {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  
  const { data: existing } = await sb.from('qa_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single();
  
  if (existing) {
    await sb.from('qa_bookmarks').delete().eq('id', existing.id);
    return false; // removed
  } else {
    await sb.from('qa_bookmarks').insert({ user_id: user.id, lesson_id: lessonId, note });
    return true; // added
  }
}

// ========== DISCUSSION HELPERS ==========

async function getDiscussions(courseId, lessonId = null) {
  let query = sb.from('qa_discussions')
    .select('*, profiles(full_name, avatar_url)')
    .eq('course_id', courseId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (lessonId) query = query.eq('lesson_id', lessonId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function createDiscussion(courseId, lessonId, title, body) {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  
  const { data, error } = await sb.from('qa_discussions').insert({
    course_id: courseId,
    lesson_id: lessonId,
    user_id: user.id,
    title,
    body
  }).select().single();
  if (error) throw error;
  return data;
}

// ========== QUIZ HELPERS ==========

async function getQuiz(lessonId) {
  const { data } = await sb.from('qa_quizzes')
    .select('*, qa_quiz_questions(*, qa_quiz_options(*))')
    .eq('lesson_id', lessonId)
    .single();
  return data;
}

async function submitQuizAttempt(quizId, answers, score, passed, timeTaken) {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  
  const { data, error } = await sb.from('qa_quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    answers,
    score_percent: score,
    passed,
    time_taken_seconds: timeTaken,
    completed_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// ========== REVIEW HELPERS ==========

async function submitReview(courseId, rating, title, body) {
  const user = await getUser();
  if (!user) throw new Error('Must be logged in');
  
  const { data, error } = await sb.from('qa_reviews').upsert({
    user_id: user.id,
    course_id: courseId,
    rating,
    title,
    body
  }, { onConflict: 'user_id,course_id' }).select().single();
  if (error) throw error;
  return data;
}

// ========== ANALYTICS ==========

async function trackEvent(eventType, courseId = null, lessonId = null, metadata = {}) {
  const user = await getUser();
  sb.from('qa_analytics_events').insert({
    user_id: user?.id,
    event_type: eventType,
    course_id: courseId,
    lesson_id: lessonId,
    metadata,
    referrer: document.referrer
  });  // fire-and-forget, no await
}

// ========== UTILITY ==========

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatPrice(cents) {
  if (!cents || cents === 0) return 'Free';
  return '$' + (cents / 100).toFixed(2);
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return new Date(date).toLocaleDateString();
}
