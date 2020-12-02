import { ShepherdOptionsWithType } from "react-shepherd";

export const onboardingSteps: ShepherdOptionsWithType[] = [
    {
        id: 'step-one',
        buttons: [
            {
                classes: 'shepherd-button-secondary',
                text: 'Exit',
                type: 'cancel'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Back',
                type: 'back'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Next',
                type: 'next'
            }
        ],
        title: `Step 1`,
        text: [`<a target="_blank" rel="noreferrer"
        href="https://notion-graphs-assets.s3.amazonaws.com/copy_link.gif">
        <img src="https://notion-graphs-assets.s3.amazonaws.com/copy_link.gif"
          alt="Copy Notion Database View Link" />
      </a> Welcome to Notion Graphs! To start using, find the link of a view for notion database you want to visualize. A notion database\'s view can be a gallery, kanban board, list, table, etc.`]
    },
    {
        id: 'step-two',
        buttons: [
            {
                classes: 'shepherd-button-secondary',
                text: 'Exit',
                type: 'cancel'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Back',
                type: 'back'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Next',
                type: 'next'
            }
        ],
        title: 'Step 2',
        text: [`<a target="_blank" rel="noreferrer"
        href="https://notion-graphs-assets.s3.amazonaws.com/fill_in_fields.gif">
        <img src="https://notion-graphs-assets.s3.amazonaws.com/fill_in_fields.gif"
          alt="Fill in Fields" />
      </a>Fill out the link, and the fields of the database that correspond to the properties of the graph.`]
    },
    {
        id: 'step-three',
        buttons: [
            {
                classes: 'shepherd-button-secondary',
                text: 'Exit',
                type: 'cancel'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Back',
                type: 'back'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'Done',
                type: 'next'
            }
        ],
        title: 'Step 3',
        text: [`<a target="_blank" rel="noreferrer"
        href="https://notion-graphs-assets.s3.amazonaws.com/create_graph.gif">
        <img src="https://notion-graphs-assets.s3.amazonaws.com/create_graph.gif"
          alt="Create Graph" />
      </a>Click "Create Graph" and embed the graph within Notion!`]
    }
    // ...
];

export const onboardingOptions = {
    defaultStepOptions: {
        cancelIcon: {
            enabled: true
        }
    },
    useModalOverlay: true
};
