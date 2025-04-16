
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import FeaturedSkills from "@/components/home/FeaturedSkills";
import HowItWorks from "@/components/home/HowItWorks";
import SkillCategories from "@/components/home/SkillCategories";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

const Index: React.FC = () => {
  return (
    <MainLayout>
      <Hero />
      <HowItWorks />
      <FeaturedSkills />
      <SkillCategories />
      <Testimonials />
      <CallToAction />
    </MainLayout>
  );
};

export default Index;
