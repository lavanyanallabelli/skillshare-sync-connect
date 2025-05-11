import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProfileLayout from '@/components/layout/ProfileLayout';

// Sample skill categories
const skillCategories = [
  { id: 1, name: "Programming & Development", skills: ["JavaScript", "Python", "React", "Node.js", "Java", "C++", "PHP", "HTML/CSS", "SQL"] },
  { id: 2, name: "Design", skills: ["UX/UI Design", "Graphic Design", "Adobe Photoshop", "Figma", "Illustration", "Animation", "Typography"] },
  { id: 3, name: "Business", skills: ["Marketing", "SEO", "Sales", "Project Management", "Accounting", "Entrepreneurship"] },
  { id: 4, name: "Language", skills: ["English", "Spanish", "French", "German", "Mandarin", "Japanese", "Italian"] },
  { id: 5, name: "Music", skills: ["Piano", "Guitar", "Singing", "Music Theory", "Production", "Drums", "Composition"] },
];

const SkillBadge: React.FC<{ skill: string; onRemove?: () => void; className?: string }> = ({ 
  skill, 
  onRemove, 
  className = "" 
}) => (
  <Badge className={`m-1 ${className}`}>
    {skill}
    {onRemove && (
      <button onClick={onRemove} className="ml-1">
        <X size={12} />
      </button>
    )}
  </Badge>
);

const Skills: React.FC = () => {
  const { toast } = useToast();
  const { userId, refreshUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    const fetchSkills = async () => {
      try {
        // Fetch teaching skills
        const { data: teachingData, error: teachingError } = await supabase
          .from('teaching_skills')
          .select('skill, proficiency_level')
          .eq('user_id', userId);
          
        if (teachingError) throw teachingError;
        
        // Fetch learning skills
        const { data: learningData, error: learningError } = await supabase
          .from('learning_skills')
          .select('skill')
          .eq('user_id', userId);
          
        if (learningError) throw learningError;
        
        // Set the fetched data
        const teachingSkills = teachingData.map(item => item.skill);
        setTeachSkills(teachingSkills);
        
        const learningSkills = learningData.map(item => item.skill);
        setLearnSkills(learningSkills);
        
        // Set skill levels
        const levels: Record<string, string> = {};
        teachingData.forEach(item => {
          levels[item.skill] = item.proficiency_level;
        });
        setSkillLevel(levels);
        
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast({
          title: "Error fetching skills",
          description: "Failed to load your skills. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkills();
  }, [userId, toast]);
  
  const handleAddTeachSkill = (skill: string) => {
    if (!teachSkills.includes(skill)) {
      setTeachSkills([...teachSkills, skill]);
      setSkillLevel({...skillLevel, [skill]: "Intermediate"});
      toast({
        title: "Skill added",
        description: `${skill} added to your teaching skills`,
      });
    }
  };
  
  const handleAddLearnSkill = (skill: string) => {
    if (!learnSkills.includes(skill)) {
      setLearnSkills([...learnSkills, skill]);
      toast({
        title: "Skill added",
        description: `${skill} added to your learning skills`,
      });
    }
  };
  
  const handleRemoveTeachSkill = (skill: string) => {
    setTeachSkills(teachSkills.filter(s => s !== skill));
    const newSkillLevel = {...skillLevel};
    delete newSkillLevel[skill];
    setSkillLevel(newSkillLevel);
  };
  
  const handleRemoveLearnSkill = (skill: string) => {
    setLearnSkills(learnSkills.filter(s => s !== skill));
  };
  
  const handleUpdateSkillLevel = (skill: string, level: string) => {
    setSkillLevel({...skillLevel, [skill]: level});
  };
  
  const handleSaveTeachSkills = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    try {
      // First, delete all existing teaching skills
      const { error: deleteError } = await supabase
        .from('teaching_skills')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the current teaching skills
      const skillsToInsert = teachSkills.map(skill => ({
        user_id: userId,
        skill,
        proficiency_level: skillLevel[skill] || 'Intermediate'
      }));
      
      if (skillsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('teaching_skills')
          .insert(skillsToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Refresh user profile data to show updated skills
      await refreshUserData();
      
      toast({
        title: "Teaching skills saved",
        description: `${teachSkills.length} skills saved successfully`,
      });
    } catch (error) {
      console.error('Error saving teaching skills:', error);
      toast({
        title: "Error saving skills",
        description: "Failed to save your teaching skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveLearnSkills = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    try {
      // First, delete all existing learning skills
      const { error: deleteError } = await supabase
        .from('learning_skills')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the current learning skills
      const skillsToInsert = learnSkills.map(skill => ({
        user_id: userId,
        skill
      }));
      
      if (skillsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('learning_skills')
          .insert(skillsToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Refresh user profile data to show updated skills
      await refreshUserData();
      
      toast({
        title: "Learning skills saved",
        description: `${learnSkills.length} skills saved successfully`,
      });
    } catch (error) {
      console.error('Error saving learning skills:', error);
      toast({
        title: "Error saving skills",
        description: "Failed to save your learning skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredCategories = searchQuery.trim() 
    ? skillCategories.map(category => ({
        ...category,
        skills: category.skills.filter(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(category => category.skills.length > 0)
    : skillCategories;
  
  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="container py-20 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-skill-purple" />
            <p className="text-lg font-medium">Loading your skills...</p>
          </div>
        </div>
      </ProfileLayout>
    );
  }
  
  return (
    <ProfileLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Skills</h1>
        
        <Tabs defaultValue="teach" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="teach">Skills I Teach</TabsTrigger>
            <TabsTrigger value="learn">Skills I Want to Learn</TabsTrigger>
            <TabsTrigger value="browse">Browse Skills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teach" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {teachSkills.map((skill) => (
                <Card key={skill} className="w-full md:w-[calc(50%-0.5rem)]">
                  <CardHeader className="pb-2">
                    <CardTitle>{skill}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`level-${skill}`}>Your proficiency level</Label>
                        <select
                          id={`level-${skill}`}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
                          value={skillLevel[skill] || "Beginner"}
                          onChange={(e) => handleUpdateSkillLevel(skill, e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto text-destructive" 
                      onClick={() => handleRemoveTeachSkill(skill)}
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {teachSkills.length === 0 && (
                <div className="w-full text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't added any teaching skills yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("browse-tab")?.click()}
                  >
                    Browse Skills
                  </Button>
                </div>
              )}
            </div>
            
            {teachSkills.length > 0 && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveTeachSkills}
                  className="bg-skill-purple hover:bg-skill-purple-dark"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Teaching Skills
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="learn" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((skill) => (
                <SkillBadge 
                  key={skill} 
                  skill={skill} 
                  onRemove={() => handleRemoveLearnSkill(skill)} 
                  className="text-base py-2 px-4"
                />
              ))}
              {learnSkills.length === 0 && (
                <div className="w-full text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't added any learning skills yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("browse-tab")?.click()}
                  >
                    Browse Skills
                  </Button>
                </div>
              )}
            </div>
            
            {learnSkills.length > 0 && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveLearnSkills}
                  className="bg-skill-purple hover:bg-skill-purple-dark"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Learning Skills
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="browse" id="browse-tab" className="space-y-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    Select skills you can teach or want to learn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap">
                    {category.skills.map((skill) => (
                      <div key={skill} className="m-1 border rounded-lg p-2 flex flex-col items-center">
                        <span>{skill}</span>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAddTeachSkill(skill)}
                            disabled={teachSkills.includes(skill)}
                          >
                            <Plus size={12} className="mr-1" /> Teach
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAddLearnSkill(skill)}
                            disabled={learnSkills.includes(skill)}
                          >
                            <Plus size={12} className="mr-1" /> Learn
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No skills found matching your search</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  );
};

export default Skills;
