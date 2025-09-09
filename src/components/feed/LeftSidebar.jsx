import ProfileCard from './LeftSidebar/ProfileCard';
import InsightsCard from './LeftSidebar/InsightsCard';
import AnimationCard from './LeftSidebar/AnimationCard';

const LeftSidebar = () => {
  return (
    <aside className="
      w-full md:w-80
      bg-black
      rounded-xl
      shadow-lg
      p-2
      md:py-6 md:px-4
      space-y-6
      ">
      <ProfileCard />
      <InsightsCard />
      <AnimationCard />
    </aside>
  );
};

export default LeftSidebar;
