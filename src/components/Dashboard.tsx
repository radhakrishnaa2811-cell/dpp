import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { gradeLevels } from '../data/words';
import { Plus, User, BookOpen, Trophy, Calendar, HelpCircle, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addChild, fetchChild } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  // role: 'parent' | 'teacher'; // Removed role field to match Authentication.tsx
  createdAt: string;
  hasSeenTutorial: boolean;
}

interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  gradeLevel: number;
  wordsCompleted: number;
  totalWordsAttempted: number;
  averageAccuracy: number;
  lastPlayed: string;
}

interface DashboardProps {
  onStartGame: (profile: PlayerProfile, gradeLevel: number) => void;
  currentUser: User;
  onLogout: () => void;
  onShowTutorial: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onStartGame, 
  currentUser, 
  onLogout, 
  onShowTutorial 
}) => {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [newProfile, setNewProfile] = useState({
    name: '',
    age: '',
    gradeLevel: 0
  });
 
useEffect(() => {
  const loadChildren = async () => {
    setIsLoading(true);
    try {
    const savedProfiles = localStorage.getItem('phonics-profiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      const data = await fetchChild(); 
      // API returns array directly
      if (Array.isArray(data)) {
        const mappedProfiles: PlayerProfile[] = data.map((child) => {
          const gradeIndex = gradeLevels.findIndex(
            (g) => g.name.toLowerCase() === child.grade.toLowerCase()
          );

          return {
            id: child.child_id, // use backend id
            name: child.name,
            age: child.age,
            gradeLevel: gradeIndex !== -1 ? gradeIndex : 0,
            wordsCompleted: 0,
            totalWordsAttempted: 0,
            averageAccuracy: 0,
            lastPlayed: new Date().toISOString(),
          };
        });
        localStorage.setItem('phonics-profiles', JSON.stringify(mappedProfiles));
        setProfiles(mappedProfiles);
      } else {
        console.warn("Unexpected fetchChild response", data);
      }
    }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    }
    setIsLoading(false);
  };

  loadChildren();
}, []);

  const saveProfiles = (updatedProfiles: PlayerProfile[]) => {
    localStorage.setItem('phonics-profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
  };

  const handleAddProfile = async () => {
    if (newProfile.name && newProfile.age) {
      try {
        // Call the API to add child
        await addChild({
          name: newProfile.name,
          age: parseInt(newProfile.age),
          grade: gradeLevels[newProfile.gradeLevel].name
        });

        // Create local profile after successful API call
        const profile: PlayerProfile = {
          id: Date.now().toString(),
          name: newProfile.name,
          age: parseInt(newProfile.age),
          gradeLevel: newProfile.gradeLevel,
          wordsCompleted: 0,
          totalWordsAttempted: 0,
          averageAccuracy: 0,
          lastPlayed: new Date().toISOString()
        };

        const updatedProfiles = [...profiles, profile];
        saveProfiles(updatedProfiles);
        setNewProfile({ name: '', age: '', gradeLevel: 0 });
        setShowAddProfile(false);
      } catch (error) {
        console.error('Error adding child profile:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(updatedProfiles);
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(null);
    }
  };

  const formatLastPlayed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };
    
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl animate-gentle-float">🦉</div>
            <div>
              <h1 className="text-4xl font-bold text-purple-800"> Dashboard</h1>
              <p className="text-purple-600">Welcome back, {currentUser.name}! 👋</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={onShowTutorial} 
              variant="outline" 
              className="rounded-2xl btn-bouncy"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Tutorial
            </Button>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="rounded-2xl btn-bouncy"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Player Profiles */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/95 backdrop-blur border-4 border-purple-200 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Learning Profiles
                </h2>
                
                <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600 rounded-2xl btn-bouncy">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-purple-800">Add New Learning Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Child's Name</Label>
                        <Input
                          id="name"
                          value={newProfile.name}
                          onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                          placeholder="Enter child's name"
                          className="rounded-xl border-2 border-purple-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min="4"
                          max="10"
                          value={newProfile.age}
                          onChange={(e) => setNewProfile({...newProfile, age: e.target.value})}
                          placeholder="Age (4-10)"
                          className="rounded-xl border-2 border-purple-200"
                        />
                      </div>
                      <div>
                        <Label>Grade Level</Label>
                        <Select onValueChange={(value) => setNewProfile({...newProfile, gradeLevel: parseInt(value)})}>
                          <SelectTrigger className="rounded-xl border-2 border-purple-200">
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeLevels.map((grade, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {grade.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleAddProfile}
                        className="w-full bg-purple-500 hover:bg-purple-600 rounded-2xl h-12"
                      >
                        Create Profile ✨
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Profile Cards */}
              <div className="grid gap-4">
                {profiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-gentle-bounce">👶</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No profiles yet!</h3>
                    <p className="text-gray-500">Add your first child's profile to get started with learning</p>
                  </div>
                ) : (
                  profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`
                        p-4 rounded-2xl border-3 transition-all duration-300 cursor-pointer
                        ${selectedProfile?.id === profile.id 
                          ? 'border-purple-400 bg-purple-50 scale-105 shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:scale-102'
                        }
                      `}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">🧒</div>
                          <div>
                            <h3 className="text-xl font-bold text-purple-800">{profile.name}</h3>
                            <p className="text-purple-600">
                              Age {profile.age} •  Grade : {gradeLevels[profile.gradeLevel]?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile.id);
                            }}
                          >
                            Delete
                          </Button>
                        {/* <div className="text-right">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-100 rounded-xl p-2 text-center">
                              <div className="text-lg font-bold text-green-600">{profile.wordsCompleted}</div>
                              <div className="text-xs text-green-800">Words</div>
                            </div>
                            <div className="bg-blue-100 rounded-xl p-2 text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round(profile.averageAccuracy || 0)}%
                              </div>
                              <div className="text-xs text-blue-800">Score</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatLastPlayed(profile.lastPlayed)}
                          </p>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Game Selection */}
          <div>
            <Card className="p-6 bg-white/95 backdrop-blur border-4 border-blue-200 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Start Learning
              </h2>

              {selectedProfile ? (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                    <div className="text-4xl mb-2">🎯</div>
                    <h3 className="text-lg font-bold text-blue-800">{selectedProfile.name}</h3>
                    <p className="text-blue-600">Ready to learn!</p>
                  </div>

                  <div>
                    <Label className="text-blue-800 font-semibold mb-3 block">Choose Grade Level:</Label>
                    <Select onValueChange={(value) => {
                      setSelectedGradeLevel(parseInt(value));
                    }}>
                      <SelectTrigger className="rounded-xl border-2 border-blue-200 h-12">
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map((grade, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{grade.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {gradeLevels[selectedGradeLevel] && (
                    <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-2">
                        {gradeLevels[selectedGradeLevel].name}
                      </h4>
                      <p className="text-yellow-700 text-sm mb-3">
                        {gradeLevels[selectedGradeLevel].description}
                      </p>
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {selectedGradeLevel === 0 ? '🎯' : '✏️'}
                        </div>
                        <p className="text-xs text-yellow-800">
                          {selectedGradeLevel === 0 ? 'Drag & Drop Mode' : 'Writing Mode'}
                        </p>
                      </div>
                      <Button
                        className="w-full h-12 mt-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl btn-bouncy"
                        size="lg"
                        onClick={() => navigate('/demo', { state: { gradeLevel: selectedGradeLevel } })}
                      >
                        Start Demo
                      </Button>
                    </div>
                  )}

                  {/* Demo Screens */}

                  <Button
                    onClick={() => onStartGame(selectedProfile, selectedGradeLevel)}
                    disabled={gradeLevels[selectedGradeLevel] === undefined}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-2xl btn-bouncy text-white"
                    size="lg"
                  >
                    Start Adventure! 🚀
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4 animate-gentle-float">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Choose a Profile</h3>
                  <p className="text-gray-500 text-sm">Select a child's profile to start learning</p>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            {/* {selectedProfile && (
              <Card className="p-4 mt-4 bg-white/95 backdrop-blur border-4 border-green-200 rounded-3xl shadow-xl">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Progress Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Total Words:</span>
                    <span className="font-bold text-green-800">{selectedProfile.wordsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Attempts:</span>
                    <span className="font-bold text-green-800">{selectedProfile.totalWordsAttempted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Accuracy:</span>
                    <span className="font-bold text-green-800">{Math.round(selectedProfile.averageAccuracy || 0)}%</span>
                  </div>
                </div>
              </Card>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};