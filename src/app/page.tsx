import HeroBannerSlider from "@/components/layout/carousel/HeroBannerSlider";
import HotSearchBannerSlider from "@/components/layout/carousel/HotSearchBannerSlider";
import { CardListSection } from "@/components/sections/CardListSection";
import MovieCategories from "@/components/sections/MovieSection";
import PersonListSection from "@/components/sections/PersonListSection";
import { movieCountries, movieGenres } from "@/contants/mock-movies";
import React from "react";

const HomePage = () => {
  return (
    <main>
      <HeroBannerSlider />
      <MovieCategories />
      <HotSearchBannerSlider />
      {/* <PersonListSection />
      <PersonListSection />
      <CardListSection title="Movie Genres" data={movieGenres} />
      <CardListSection title="Movie Countries" data={movieCountries} /> */}
    </main>
  );
};

export default HomePage;
