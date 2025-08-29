import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAI } from '@/hooks/useAI';

// Helper function to format myth response with proper markdown rendering
const formatMythResponse = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Split text into lines for processing
  const lines = text.split('\n');
  const formattedElements: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    let formattedLine = line;
    
    // Handle bold text (**text**)
    formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle numbered lists (1. 2. 3. etc.)
    if (/^\d+\.\s/.test(formattedLine)) {
      formattedElements.push(
        <div key={index} className="ml-4 mb-2">
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      );
    }
    // Handle bullet points (- or •)
    else if (/^[-•]\s/.test(formattedLine)) {
      formattedElements.push(
        <div key={index} className="ml-4 mb-1">
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      );
    }
    // Handle section headers (lines that end with :)
    else if (formattedLine.endsWith(':') && formattedLine.length < 50) {
      formattedElements.push(
        <h4 key={index} className="font-semibold text-primary mt-3 mb-2" 
            dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    }
    // Regular paragraphs
    else if (formattedLine.trim()) {
      formattedElements.push(
        <p key={index} className="mb-2 leading-relaxed" 
           dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    }
    // Empty lines for spacing
    else {
      formattedElements.push(<br key={index} />);
    }
  });
  
  return <div className="space-y-1">{formattedElements}</div>;
};

const COMMON_MYTHS = [
  {
    myth: "Mental health problems are a sign of weakness",
    truth: "Mental health conditions are medical conditions, just like diabetes or heart disease. They have nothing to do with personal strength or character.",
    category: "Stigma"
  },
  {
    myth: "Talking about mental health makes it worse",
    truth: "Research consistently shows that talking about mental health concerns with trusted people and professionals leads to better outcomes and recovery.",
    category: "Treatment"
  },
  {
    myth: "Only 'crazy' people need mental health support",
    truth: "1 in 4 people experience mental health challenges. It affects people from all walks of life, including students, professionals, and families.",
    category: "Stigma"
  },
  {
    myth: "Meditation and prayer are enough to cure depression",
    truth: "While spiritual practices can be helpful complementary tools, clinical depression often requires professional treatment including therapy and/or medication.",
    category: "Treatment"
  },
  {
    myth: "Indian families don't have mental health problems",
    truth: "Mental health challenges exist across all cultures and communities. Indian families face unique stressors like academic pressure, arranged marriages, and generational trauma.",
    category: "Cultural"
  },
  {
    myth: "Antidepressants change your personality",
    truth: "When prescribed correctly, antidepressants help restore normal brain chemistry and help you feel more like yourself, not different.",
    category: "Medication"
  },
  {
    myth: "If you're successful, you can't have mental health problems",
    truth: "Success and mental health are independent. Many successful people, including celebrities and professionals, openly discuss their mental health journeys.",
    category: "Stigma"
  },
  {
    myth: "Therapy is only for rich people",
    truth: "Many affordable and free mental health resources exist, including government programs, NGOs, helplines, and community mental health centers.",
    category: "Access"
  }
];

const MythBuster = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customMyth, setCustomMyth] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const { getMythBusterResponse, isLoading } = useAI();

  const categories = [...new Set(COMMON_MYTHS.map(m => m.category))];

  const filteredMyths = COMMON_MYTHS.filter(myth => {
    const matchesSearch = searchQuery === '' || 
      myth.myth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      myth.truth.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || myth.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCustomMythSubmit = async () => {
    if (!customMyth.trim() || isLoading) return;

    try {
      const response = await getMythBusterResponse(customMyth);
      setCustomResponse(response);
    } catch (error) {
      console.error('Error getting myth response:', error);
      setCustomResponse("I apologize, but I'm having trouble processing that right now. Please try again or consult a mental health professional for accurate information.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Myth Buster</h1>
                <p className="text-sm text-muted-foreground">Separating fact from fiction in mental health</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search and Filters */}
        <Card className="shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for myths or topics..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Myth Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Common Myths ({filteredMyths.length})
            </h2>
            
            {filteredMyths.map((item, index) => (
              <Card key={index} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-3">
                        {item.category}
                      </Badge>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        ❌ Myth: "{item.myth}"
                      </h3>
                    </div>
                    
                    <div className="p-4 bg-healing-soft/20 rounded-lg border-l-4 border-healing">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-healing mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-healing mb-1">Truth:</h4>
                          <p className="text-sm text-foreground leading-relaxed">
                            {item.truth}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredMyths.length === 0 && (
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No myths found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Custom Myth Checker */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Ask About Any Myth</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Have a specific mental health myth you want to check? Ask here!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={customMyth}
                  onChange={(e) => setCustomMyth(e.target.value)}
                  placeholder="e.g., 'Does stress cause gray hair?'"
                />
                <Button 
                  onClick={handleCustomMythSubmit}
                  disabled={!customMyth.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Checking...' : 'Check This Myth'}
                </Button>
                
                {customResponse && (
                  <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                    <div className="text-sm leading-relaxed">
                      {formatMythResponse(customResponse)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Links */}
            <Card className="shadow-soft border-healing/20 bg-healing-soft/10">
              <CardHeader>
                <CardTitle className="text-healing">Trusted Resources</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>For evidence-based mental health information:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>National Institute of Mental Health (NIMH)</li>
                  <li>World Health Organization (WHO)</li>
                  <li>Indian Psychiatric Society</li>
                  <li>NIMHANS (National Institute of Mental Health)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  Always consult qualified mental health professionals for personalized advice.
                </p>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-healing" />
                  <span>1 in 4 people experience mental health issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-healing" />
                  <span>Treatment is effective for most conditions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-healing" />
                  <span>Mental health affects all ages and backgrounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-healing" />
                  <span>Seeking help is a sign of strength</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MythBuster;