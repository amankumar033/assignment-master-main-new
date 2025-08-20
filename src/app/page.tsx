"use client";
import Products from "@/components/Products";
import Categories from "@/components/Categories";
import Brands from "@/components/Brands";
import Deals from "@/components/Deals";
// import Guide from "@/components/Guidelines";

export default function HomePage() {
  return (
    <div>
      <main className="pt-0">
        <Categories />
        <Products />
        <Brands />
        <Deals />
      
      </main>
    </div>
  );
}