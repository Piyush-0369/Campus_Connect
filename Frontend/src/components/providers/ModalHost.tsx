"use client";

import { useModal } from "./useModal";
import ProjectModal from "@/components/modals/ProjectModal";
import AchievementModal from "@/components/modals/AchievementModal";
import ExperienceModal from "@/components/modals/ExperienceModal";
import AlumniEditProfileModal from "@/components/modals/AlumniEditProfileModal";
import StudentEditProfileModal from "@/components/modals/StudentEditProfileModal";

export default function ModalHost() {
  const { modal, closeModal } = useModal();

  if (!modal.type) return null;

  switch (modal.type) {
    case "project":
      return (
        <ProjectModal
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );

    case "achievement":
      return (
        <AchievementModal
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );

    case "experience":
      return (
        <ExperienceModal
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );
    case "alumniEditProfile":
      return (
        <AlumniEditProfileModal
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );
    case "studentEditProfile":
      return (
        <StudentEditProfileModal    
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );
    case "DetailsCard":
      const DetailsCard = require('@/components/modals/DetailsCard').default;
      return (
        <DetailsCard
          open={true}
          onClose={closeModal}
          {...modal.props}
        />
      );
    default:
      return null;
  }
}
