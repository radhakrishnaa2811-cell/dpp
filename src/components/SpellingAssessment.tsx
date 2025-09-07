import React from 'react';

interface SpellingAssessmentProps {
  assessmentData: any;
  onBackToDashboard: () => void;
}

const SpellingAssessment: React.FC<SpellingAssessmentProps> = ({
  assessmentData,
  onBackToDashboard
}) => {
  const phonics = assessmentData?.assessment_summary?.Phonics;
  const sightWords = assessmentData?.assessment_summary?.['Sight Words'];
  const phonicsPercentage = Math.round(assessmentData.assessment_summary?.['Phonics'].percentage);
  const sightWordsPercentage = Math.round(assessmentData.assessment_summary?.['Sight Words'].percentage);
  const error_analysis = assessmentData.error_analysis;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold">Spelling Assessment</h1>
      </div>
      <h2 className="text-xl font-semibold mb-3">Assessment Summary</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold">Phonics</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm font-medium">
              Devenovin
            </span>
          </div>
          <div className="text-2xl font-bold">
            {phonics.score}/{phonics.max_score}
            <span className="text-gray-500 ml-2">({phonicsPercentage}%)</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold">Sight Words</span>
          </div>
          <div className="text-2xl font-bold">
            {sightWords.score}/{sightWords.max_score}
            <span className="text-gray-500 ml-2">({sightWordsPercentage}%)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-xl font-semibold mb-3">Error Analysis (Phonics Only)</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-600 font-medium">Error Type</th>
              <th className="text-right py-2 text-gray-600 font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-2">Short vowel error</td>
              <td className="text-right py-2">{error_analysis?.['Short vowel error'] || 0}</td>
            </tr>
            <tr className="border-b border-gray-50">
              <td className="py-2">Digraph confusion (ch/sh)</td>
              <td className="text-right py-2">{error_analysis?.['Digraph confusion (ch/sh/th)']}</td>
            </tr>
            <tr className="border-b border-gray-50">
              <td className="py-2">Blend/cluster error</td>
              <td className="text-right py-2">{error_analysis?.['Blend/cluster error'] || 0}</td>
            </tr>
            <tr>
              <td className="py-2">Ending consonant error</td>
              <td className="text-right py-2">{error_analysis?.['Ending consonant error']}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-3">Instructional Recommendation</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 text-sm">
            {assessmentData?.instructional_recommendation || 'No specific recommendations at this time.'}
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SpellingAssessment;
