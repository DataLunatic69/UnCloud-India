import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Mic, Volume2, MoreVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const ChatInterface = () => {
  const navigate = useNavigate();

  const handleNavigateToTherapist = () => {
    navigate('/ai-therapist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "नमस्ते! I'm here to listen and support you. What's on your mind today? You can share anything - I'm here without judgment.",
      timestamp: new Date()
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    const currentMessage = message;
    setMessage("");
    
    // Simulate varied AI responses based on input
    setTimeout(() => {
      let response = "I hear you. It sounds like you're going through something challenging right now. Can you tell me a bit more about what's been weighing on your mind?";
      
      const lowerMessage = currentMessage.toLowerCase();
      if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('down')) {
        response = "I'm sorry you're feeling this way. Depression can make everything feel more difficult, but please know that these feelings can improve with the right support. You don't have to carry this alone. Can you tell me more about how long you've been feeling this way?";
      } else if (lowerMessage.includes('unemployed') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
        response = "Job-related stress and unemployment can be really challenging, especially with the added pressure from family and society. Your worth isn't defined by your employment status. Let's talk about what you're experiencing and explore some ways to manage this difficult time.";
      } else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
        response = "Anxiety is a very treatable condition, and you're taking a positive step by reaching out. Many effective techniques can help manage anxiety symptoms. Have you noticed any particular situations or thoughts that tend to trigger your anxiety?";
      } else if (lowerMessage.includes('family') || lowerMessage.includes('parents')) {
        response = "Family relationships can be complex, especially when there are different expectations about your future. It's important to find a balance between respecting your family and taking care of your own wellbeing. What specific family pressures are you experiencing?";
      } else if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('academic')) {
        response = "Academic stress is incredibly common among students in India. The pressure to excel can feel overwhelming. Let's talk about some strategies to manage this stress while still working toward your goals. What aspect of your studies is causing you the most anxiety right now?";
      }
      
      const aiResponse = {
        id: messages.length + 2,
        sender: "ai", 
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <section id="chat-interface" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Experience
            <span className="bg-gradient-hero bg-clip-text text-transparent"> AI Therapy</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See how our culturally-aware AI therapist provides empathetic, judgment-free support
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-strong">
            <CardHeader className="bg-gradient-calm rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Therapist</CardTitle>
                    <p className="text-sm text-muted-foreground">Always here, always listening</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-primary-soft/20 to-background">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card shadow-soft border border-border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" 
                    onClick={() => {
                      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({ audio: true })
                          .then(stream => {
                            // Mic access granted - start recording demo
                            console.log('Mic access granted - recording for 3 seconds');
                            alert('🎤 Microphone is working! (Demo recording for 3 seconds)');
                            
                            // Stop the stream after demo
                            setTimeout(() => {
                              stream.getTracks().forEach(track => track.stop());
                              console.log('Demo recording stopped');
                            }, 3000);
                          })
                          .catch(error => {
                            console.log('Mic access denied:', error);
                            alert('❌ Microphone access denied. Please enable microphone permissions in your browser settings.');
                          });
                      } else {
                        alert('❌ Microphone not supported in this browser.');
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    placeholder="Share what's on your mind... (English/Hindi welcome)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  
                  <Button variant="ghost" size="icon"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const testMessage = 'Hello! This is a test of the speaker functionality. Your audio is working correctly.';
                        const utterance = new SpeechSynthesisUtterance(testMessage);
                        utterance.rate = 0.9;
                        utterance.pitch = 1.0;
                        utterance.volume = 0.8;
                        
                        utterance.onstart = () => {
                          console.log('Speech started');
                        };
                        
                        utterance.onend = () => {
                          console.log('Speech ended');
                          alert('🔊 Speaker test completed! Did you hear the message clearly?');
                        };
                        
                        utterance.onerror = (event) => {
                          console.error('Speech error:', event);
                          alert('❌ Speaker test failed. Please check your audio settings.');
                        };
                        
                        window.speechSynthesis.speak(utterance);
                        alert('🔊 Playing speaker test... Listen for the audio message.');
                      } else {
                        alert('❌ Text-to-speech not supported in this browser.');
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="hero" size="icon" onClick={handleSend}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This conversation is completely private. You can delete it anytime.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <Button 
              variant="hero" 
              size="lg"
              onClick={handleNavigateToTherapist}
            >
              Start Your Real Conversation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;