import Banner from "@/components/sites/home/Banner";
import FAQ from "@/components/sites/home/FAQ";
import ManageAndDeliver from "@/components/sites/home/ManageAndDeliver";
import PlanSection from "@/components/sites/home/PlanSection";
import ReadyWorkFlow from "@/components/sites/home/ReadyWorkFlow";
import SimpleWorkFlow from "@/components/sites/home/SimpleWorkFlow";
import Testmonial from "@/components/sites/home/Testmonial";
import useClient from "@/hooks/useClient";
import useSEO from "@/hooks/useSEO";

const Home = () => {
  useSEO({
    title: "STAKD | The Ultimate Creator Workspace & Campaign Manager",
    description: "STAKD is the all-in-one simple workflow built for creators. Upload, share content, get brand approvals, track invoices, and manage your campaigns with confidence.",
    keywords: "stakd, creator platform, influencer marketing tools, creator campaign manager, workflow for creators, brand approval tool, content creator dashboard"
  });

  const { data } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
    initialData: {
      status: "success",
      data: {
        banner_title: "Manage your campaigns. Deliver with confidence.",
        banner_subtext: "Upload, share, and get approvals from brands - all in one simple workflow built for creators.",
        banner_cta: "Get Started Free",
        banner_image: "uploads/cms/heroImage.png",
      }
    }
  });

  const cms = data?.data || {};

  return (
    <div className=" flex flex-col lg:gap-[120px] gap-8 ">
      <Banner cms={cms} />
      <ManageAndDeliver cms={cms} />
      <SimpleWorkFlow cms={cms} />
      <PlanSection />
      <Testmonial cms={cms} />
      <FAQ />
      <ReadyWorkFlow cms={cms} />
    </div>
  );
};

export default Home;
