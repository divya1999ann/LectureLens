import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, FileText, File, MessageSquare, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { coursesAPI, getErrorMessage } from '../../services/api';

const SubjectDetail = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await coursesAPI.get(id);
        setSubject(data);
        setLectures(data.lectures || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!subject) {
    return <div className="p-8">Subject not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{subject.title}</h1>
            <h2 className="text-2xl font-light mb-4">{subject.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span>Instructor: {subject.teacher_name}</span>
            </div>
          </div>
          <Link to={`/subjects/${id}/chat`}>
            <Button size="lg" variant="secondary">
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask AI
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-white/90 max-w-3xl">{subject.description}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lectures" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures" className="space-y-4">
          {lectures.map((lecture, idx) => (
            <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {idx + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {lecture.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(lecture.lecture_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{lecture.material_count} materials</span>
                      </div>
                    </div>



                    <div className="flex gap-2">
                      <Link to={`/subjects/${id}/lectures/${lecture.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No additional resources available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubjectDetail;