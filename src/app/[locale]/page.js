'use client';

import Categories from '@/components/Categories';
import NewProducts from '@/components/NewProducts';
import TopSellingProducts from '@/components/TopSellingProducts';
import HeroSection from '@/components/HeroSection';
import CategoryProducts from '@/components/CategoryProducts';
import CountriesSection from '@/components/CountriesSection';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Banners from '@/components/Banners';
import Container from '@/components/Container';

export default function Home() {

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <Banners />
      <Container className="py-8">
        <CountriesSection/>
        <div className="mt-12">
          <Categories />
        </div>
        <div className="mt-12">
          <NewProducts />
        </div>
        <div className="mt-12">
          <TopSellingProducts />
        </div>
      </Container>
    </main>
  );
}