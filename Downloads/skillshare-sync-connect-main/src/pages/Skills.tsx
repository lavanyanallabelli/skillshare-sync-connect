import React, { useState } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [teachSkills, setTeachSkills] = useState<string[]>(["JavaScript", "React"]);
  const [learnSkills, setLearnSkills] = useState<string[]>(["Python", "UX/UI Design"]);
  const [skillLevel, setSkillLevel] = useState<Record<string, string>>({
    "JavaScript": "Advanced",
    "React": "Intermediate",
  });
  
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
  
  const handleSaveTeachSkills = () => {
    toast({
      title: "Teaching skills saved",
      description: `${teachSkills.length} skills saved successfully`,
    });
  };
  
  const handleSaveLearnSkills = () => {
    toast({
      title: "Learning skills saved",
      description: `${learnSkills.length} skills saved successfully`,
    });
  };
  
  const filteredCategories = searchQuery.trim() 
    ? skillCategories.map(category => ({
        ...category,
        skills: category.skills.filter(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(category => category.skills.length > 0)
    : skillCategories;
  
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
                >
                  <Save className="mr-2 h-4 w-4" /> Save Teaching Skills
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
                >
                  <Save className="mr-2 h-4 w-4" /> Save Learning Skills
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
