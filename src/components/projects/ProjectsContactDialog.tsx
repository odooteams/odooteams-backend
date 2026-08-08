import React from 'react';
import QuoteRequestDialog from './QuoteRequestDialog';

interface ProjectsContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  projectCost?: string;
  onSendToWhatsApp?: (formData: any) => void; // ignored — submissions go to backend
}

const ProjectsContactDialog: React.FC<ProjectsContactDialogProps> = (props) => (
  <QuoteRequestDialog
    open={props.open}
    onOpenChange={props.onOpenChange}
    projectTitle={props.projectTitle}
    projectCost={props.projectCost}
    variant="gold"
  />
);

export default ProjectsContactDialog;
