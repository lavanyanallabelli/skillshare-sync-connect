
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import SkillCategories from '@/components/home/SkillCategories';
import FeaturedSkills from '@/components/home/FeaturedSkills';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <MainLayout>
      <Hero />
      <HowItWorks />
      <SkillCategories />
      <FeaturedSkills />
      <Testimonials />
      <CallToAction />
    </MainLayout>
  );
};

export default Home;
