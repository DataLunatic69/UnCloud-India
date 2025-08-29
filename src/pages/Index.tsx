import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features"; 
import Privacy from "@/components/Privacy";
import ChatInterface from "@/components/ChatInterface";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <ChatInterface />
        <Privacy />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
