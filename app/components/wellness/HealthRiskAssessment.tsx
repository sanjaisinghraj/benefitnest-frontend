'use client';

import React, { useState, useEffect } from 'react';

const API_URL = 'https://benefitnest-backend.onrender.com';

interface HRAQuestion {
  id: string;
  category: string;
  question_text: string;
  question_type: 'single_choice' | 'multi_choice' | 'scale' | 'text' | 'number';
  options: string[];
  is_required: boolean;
}

interface HRAResult {
  total_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  category_scores: Record<string, number>;
  ai_summary?: string;
  ai_focus_areas?: string[];
  ai_suggestions?: string[];
}

const categoryIcons: Record<string, string> = {
  general_health: '❤️',
  lifestyle: '🏃',
  nutrition: '🥗',
  mental_health: '🧠',
  medical_history: '📋',
  preventive: '🩺'
};

const riskLevelColors: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Risk' },
  moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate Risk' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High Risk' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical Risk' }
};

export default function HealthRiskAssessment() {
  const [questions, setQuestions] = useState<HRAQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<HRAResult | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/wellness/hra/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        // Use default questions if API fails
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error fetching HRA questions:', error);
      setQuestions(defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/wellness/hra/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ responses: answers })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        // Calculate result locally if API fails
        const localResult = calculateLocalResult(answers);
        setResult(localResult);
      }
    } catch (error) {
      console.error('Error submitting HRA:', error);
      const localResult = calculateLocalResult(answers);
      setResult(localResult);
    } finally {
      setSubmitting(false);
    }
  };

  const requestAiInsights = async () => {
    try {
      setAiProcessing(true);
      const token = localStorage.getItem('employeeToken') || localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/wellness/hra/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ responses: answers, result })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(prev => prev ? { ...prev, ...data.insights } : null);
        setShowAiInsights(true);
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const calculateLocalResult = (responses: Record<string, any>): HRAResult => {
    // Simple local scoring logic
    let totalScore = 0;
    const categoryScores: Record<string, number> = {};

    questions.forEach(q => {
      const answer = responses[q.id];
      if (answer !== undefined) {
        let score = 0;
        if (q.question_type === 'single_choice' && q.options) {
          score = q.options.indexOf(answer) * 2; // Simple scoring
        } else if (q.question_type === 'scale') {
          score = 10 - (answer || 5); // Inverse scale
        }
        totalScore += score;
        categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
      }
    });

    const maxScore = questions.length * 8;
    const riskPercentage = (totalScore / maxScore) * 100;

    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (riskPercentage > 75) riskLevel = 'critical';
    else if (riskPercentage > 50) riskLevel = 'high';
    else if (riskPercentage > 25) riskLevel = 'moderate';

    return { total_score: totalScore, risk_level: riskLevel, category_scores: categoryScores };
  };

  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900">Your Health Risk Assessment</h2>
          <p className="text-gray-600 mt-2">Based on your responses, here&apos;s your health profile</p>
        </div>

        {/* Risk Level Card */}
        <div className={`${riskLevelColors[result.risk_level].bg} rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold ${riskLevelColors[result.risk_level].text}`}>
                {riskLevelColors[result.risk_level].label}
              </h3>
              <p className="text-gray-600 mt-1">Overall health risk assessment</p>
            </div>
            <div className={`text-4xl font-bold ${riskLevelColors[result.risk_level].text}`}>
              {result.total_score}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(result.category_scores).map(([category, score]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-xl">{categoryIcons[category] || '📌'}</span>
                <span className="flex-1 capitalize text-gray-700">
                  {category.replace('_', ' ')}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.min((score / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-8">{score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>🤖</span> AI-Powered Insights
            </h3>
            {!showAiInsights && (
              <button
                onClick={requestAiInsights}
                disabled={aiProcessing}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {aiProcessing ? 'Analyzing...' : 'Get AI Insights'}
              </button>
            )}
          </div>

          {showAiInsights && result.ai_summary ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                <p className="text-gray-600">{result.ai_summary}</p>
              </div>

              {result.ai_focus_areas && result.ai_focus_areas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.ai_focus_areas.map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.ai_suggestions && result.ai_suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                  <ul className="space-y-2">
                    {result.ai_suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-500 mt-1">✓</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-500 italic">
                AI insights are suggestions only. Please consult a healthcare professional for medical advice.
              </p>
            </div>
          ) : !showAiInsights ? (
            <p className="text-sm text-gray-600">
              Click the button above to get personalized AI-powered insights based on your assessment.
              All AI interactions are logged and you can skip or ignore them.
            </p>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
              setCurrentStep(0);
              setShowAiInsights(false);
            }}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Retake Assessment
          </button>
          <button className="flex-1 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
            Create Wellness Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{categoryIcons[currentQuestion.category] || '📌'}</span>
            <span className="capitalize">{currentQuestion.category.replace('_', ' ')}</span>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {currentQuestion.question_text}
            {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'single_choice' && currentQuestion.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentAnswer === option
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    currentAnswer === option ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                  }`}>
                    {currentAnswer === option && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}

            {currentQuestion.question_type === 'multi_choice' && currentQuestion.options?.map((option, i) => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
              return (
                <button
                  key={i}
                  onClick={() => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const updated = selected
                      ? current.filter(v => v !== option)
                      : [...current, option];
                    handleAnswer(currentQuestion.id, updated);
                  }}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              );
            })}

            {currentQuestion.question_type === 'scale' && (
              <div className="py-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>1 (Low)</span>
                  <span>10 (High)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={currentAnswer || 5}
                  onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-teal-600">{currentAnswer || 5}</span>
                </div>
              </div>
            )}

            {currentQuestion.question_type === 'text' && (
              <textarea
                value={currentAnswer || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter your answer..."
              />
            )}

            {currentQuestion.question_type === 'number' && (
              <input
                type="number"
                value={currentAnswer || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter a number..."
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
          >
            Next
          </button>
        )}
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

// Default questions if API fails
const defaultQuestions: HRAQuestion[] = [
  {
    id: '1',
    category: 'general_health',
    question_text: 'How would you rate your overall health?',
    question_type: 'single_choice',
    options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    is_required: true
  },
  {
    id: '2',
    category: 'lifestyle',
    question_text: 'How many hours of sleep do you typically get per night?',
    question_type: 'single_choice',
    options: ['Less than 5', '5-6 hours', '7-8 hours', 'More than 8'],
    is_required: true
  },
  {
    id: '3',
    category: 'lifestyle',
    question_text: 'How many days per week do you exercise for at least 30 minutes?',
    question_type: 'single_choice',
    options: ['0 days', '1-2 days', '3-4 days', '5+ days'],
    is_required: true
  },
  {
    id: '4',
    category: 'lifestyle',
    question_text: 'How would you describe your stress level?',
    question_type: 'single_choice',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    is_required: true
  },
  {
    id: '5',
    category: 'nutrition',
    question_text: 'How many servings of fruits and vegetables do you eat daily?',
    question_type: 'single_choice',
    options: ['0-1', '2-3', '4-5', '6+'],
    is_required: true
  },
  {
    id: '6',
    category: 'mental_health',
    question_text: 'In the past 2 weeks, how often have you felt down or hopeless?',
    question_type: 'single_choice',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    is_required: true
  }
];
