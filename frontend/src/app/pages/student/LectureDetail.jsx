import React from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, FileText, Download, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockSubjects, mockLectures } from '../../utils/mockData';

const LectureDetail = () => {
  const { subjectId, lectureId } = useParams();
  const subject = mockSubjects.find(s => s.id === parseInt(subjectId));
  const lecture = mockLectures.find(l => l.id === parseInt(lectureId));

  if (!lecture || !subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lecture not found</h2>
        <Link to="/dashboard" className="text-blue-600 hover:underline mt-4">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Mock summary content based on lecture
  const lectureSummary = `
    This lecture provided a comprehensive overview of ${lecture.title}. 
    Key topics covered included:
    1. Introduction to the core concepts and terminology.
    2. Analysis of current industry standards and practices.
    3. Practical implementation strategies for scalable systems.
    4. Review of recent case studies and performance metrics.
    
    The professor emphasized the importance of understanding the trade-offs between different architectural approaches. Students are encouraged to review the provided examples and complete the associated practice problems before the next session.
  `;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to={`/subjects/${subjectId}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">{subject.code}</span>
              <span>•</span>
              <span>Lecture {lecture.number}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lecture.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-4">
            <Calendar className="w-4 h-4" />
            <span>{new Date(lecture.date).toLocaleDateString()}</span>
            <span className="mx-1">•</span>
            <FileText className="w-4 h-4" />
            <span>{lecture.pages}</span>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer (Left Panel) */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-4xl min-h-[1000px] p-12 text-center relative">
            {/* Simple visual representation of a document */}
            <div className="border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <div className="h-16 border-b border-gray-100 dark:border-gray-700 mb-8 flex items-center justify-between px-8 bg-gray-50 dark:bg-gray-900/50">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <div className="px-12 space-y-6 text-left opacity-30">
                <div className="h-8 bg-gray-800 dark:bg-white rounded w-3/4 mb-12"></div>

                <div className="space-y-3">
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-5/6"></div>
                </div>

                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded w-full my-8 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>

                <div className="space-y-3">
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-5/6"></div>
                </div>
              </div>

              <div className="mt-auto p-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
                Page 1 of {parseInt(lecture.pages) || 15}
              </div>
            </div>
          </div>
        </div>

        {/* Summary (Right Panel) */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Lecture Summary
            </h3>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="prose dark:prose-invert text-sm max-w-none">
              <p className="whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
                {lectureSummary}
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Key Takeaways</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Understanding system architecture</li>
                <li>Design patterns for scalability</li>
                <li>Performance optimization techniques</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureDetail;