
INSERT INTO surveys (id, title, description, status, created_at, is_template, template_category, branding, questions)
VALUES 
(
  'template-001', 
  'Employee Engagement Survey', 
  'Measure employee satisfaction and engagement levels.', 
  'active', 
  NOW(), 
  TRUE, 
  'HR', 
  '{"primaryColor": "#4f46e5", "backgroundColor": "#f9fafb", "headingColor": "#111827", "fontFamily": "Inter", "headingSize": "text-3xl", "headingBold": true, "questionColor": "#374151"}',
  '[
    {"id": "q1", "type": "nps", "text": "How likely are you to recommend our company as a place to work?", "required": true, "scaleConfig": {"min": 0, "max": 10, "minLabel": "Not Likely", "maxLabel": "Very Likely"}},
    {"id": "q2", "type": "rating", "text": "How would you rate your work-life balance?", "required": true, "scaleConfig": {"min": 1, "max": 5}},
    {"id": "q3", "type": "textarea", "text": "What is one thing we could do to improve your experience here?", "required": false}
  ]'::jsonb
),
(
  'template-002', 
  'Customer Satisfaction (CSAT)', 
  'Gather feedback from customers after a support interaction.', 
  'active', 
  NOW(), 
  TRUE, 
  'Customer Success', 
  '{"primaryColor": "#059669", "backgroundColor": "#ecfdf5", "headingColor": "#064e3b", "fontFamily": "Roboto", "headingSize": "text-2xl", "headingBold": true, "questionColor": "#065f46"}',
  '[
    {"id": "q1", "type": "rating", "text": "How satisfied were you with the support you received?", "required": true},
    {"id": "q2", "type": "radio", "text": "Was your issue resolved?", "required": true, "options": [{"id": "o1", "label": "Yes"}, {"id": "o2", "label": "No"}]},
    {"id": "q3", "type": "textarea", "text": "Any additional feedback?", "required": false}
  ]'::jsonb
),
(
  'template-003', 
  'Event Feedback', 
  'Collect feedback from event attendees.', 
  'active', 
  NOW(), 
  TRUE, 
  'Events', 
  '{"primaryColor": "#db2777", "backgroundColor": "#fdf2f8", "headingColor": "#831843", "fontFamily": "Lato", "headingSize": "text-4xl", "headingBold": true, "headingItalic": true, "questionColor": "#9d174d"}',
  '[
    {"id": "q1", "type": "rating", "text": "How would you rate the overall event?", "required": true},
    {"id": "q2", "type": "checkbox", "text": "Which sessions did you attend?", "required": false, "options": [{"id": "o1", "label": "Keynote"}, {"id": "o2", "label": "Workshop A"}, {"id": "o3", "label": "Networking Mixer"}]},
    {"id": "q3", "type": "text", "text": "What was your favorite part of the event?", "required": false}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
