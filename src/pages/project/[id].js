// pages/project/[id].js
import { useRouter } from "next/router";
import ProjectBoard from "../../components/collab/ProjectBoard";
import Navbar from "../../components/layout/Navbar";

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;
  if (!id) return <div>Loading...</div>;
  return (
    <>
      <Navbar />
      <ProjectBoard projectId={id} />
    </>
  );
}
