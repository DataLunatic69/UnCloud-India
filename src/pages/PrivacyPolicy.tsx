import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Lock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              <div className="w-10 h-10 bg-healing-soft rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-healing" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Your privacy is our priority</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Overview */}
        <Card className="shadow-soft mb-8 border-healing/20 bg-healing-soft/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-healing">
              <Shield className="w-5 h-5" />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">What We See</h3>
              <p className="text-sm text-muted-foreground">Only what you choose to share</p>
            </div>
            <div className="text-center">
              <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">How We Protect</h3>
              <p className="text-sm text-muted-foreground">End-to-end encryption</p>
            </div>
            <div className="text-center">
              <Trash2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground">Your Control</h3>
              <p className="text-sm text-muted-foreground">Delete anytime</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-8">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Personal Information (Optional)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  We only collect information you voluntarily provide:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Email address (for account creation)</li>
                  <li>• Age range (for age-appropriate content)</li>
                  <li>• General location (for local resources, with your permission)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Conversation Data</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your mental health conversations are:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Encrypted and stored securely</li>
                  <li>• Never shared with third parties</li>
                  <li>• Deletable by you at any time</li>
                  <li>• Used only to provide personalized support</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Providing Support</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Personalized therapy conversations</li>
                  <li>• Relevant meditation and affirmation suggestions</li>
                  <li>• Crisis detection and safety resources</li>
                  <li>• Progress tracking (mood, goals)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">What We DON'T Do</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Sell your data to anyone</li>
                  <li>• Share conversations with family, friends, or employers</li>
                  <li>• Use your data for advertising</li>
                  <li>• Store unnecessary personal information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Your Rights & Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Access & Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data at any time through your account settings.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Delete & Forget</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete individual conversations or your entire account.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Control Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    Turn off AI memory features if you prefer each conversation to be independent.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Manage Sharing</h4>
                  <p className="text-sm text-muted-foreground">
                    Control what information is used for personalization and local resource suggestions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700">Important Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-600">
                <strong>This is not professional medical care.</strong> While we prioritize your privacy, 
                if you express intent to harm yourself or others, we may need to guide you to emergency resources.
              </p>
              <p className="text-sm text-red-600">
                We use AI models that, while secure, are not infallible. Always verify important health 
                information with qualified professionals.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Contact & Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This privacy policy was last updated on August 25, 2025. We'll notify you of any significant 
                changes through the app and via email if you've provided one.
              </p>
              <p className="text-sm text-muted-foreground">
                Questions about privacy? Contact us at{' '}
                <a href="mailto:privacy@uncloud.in" className="text-primary hover:underline">
                  privacy@uncloud.in
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link to="/ai-therapist">
            <Button size="lg">
              Start Your Private Conversation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;