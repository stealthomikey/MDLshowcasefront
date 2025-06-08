
import Welcome from '@/components/home/Welcome';
import Login from '../components/home/Login';
import RecipeSection from '@/components/home/RecipeSection';

// home page content
export default function HomePage() {
  return (
    <>
      <main>
        <Welcome />
        <Login />
        <RecipeSection />
      </main>
    </>
  );
}