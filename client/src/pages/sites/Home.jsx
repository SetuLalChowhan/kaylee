import Banner from "@/components/sites/home/Banner";
import FAQ from "@/components/sites/home/FAQ";
import ManageAndDeliver from "@/components/sites/home/ManageAndDeliver";
import PlanSection from "@/components/sites/home/PlanSection";
import ReadyWorkFlow from "@/components/sites/home/ReadyWorkFlow";
import SimpleWorkFlow from "@/components/sites/home/SimpleWorkFlow";
import Testmonial from "@/components/sites/home/Testmonial";
import useClient from "@/hooks/useClient";

const Home = () => {
  const { data } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
  });

  const cms = data?.data || {};

  return (
    <div className=" flex flex-col lg:gap-[120px] gap-10 ">
      <Banner cms={cms} />
      <ManageAndDeliver cms={cms} />
      <SimpleWorkFlow />
      <PlanSection />
      <Testmonial cms={cms} />
      <FAQ />
      <ReadyWorkFlow />
    </div>
  );
};

export default Home;
