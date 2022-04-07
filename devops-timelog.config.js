module.exports = (env) => {
  var idPostfix, namePostfix;

  switch (env.mode) {
    case 'development':
      idPostfix = '-dev';
      namePostfix = ' [DEV]';
      break;
    case 'staging':
      idPostfix = '-staging';
      namePostfix = ' [STAGING]';
      break;
    default:
      idPostfix = '';
      namePostfix = '';
  }

  let version = env.version;

  let manifest = {
    manifestVersion: 1,
    id: `DevOps-TimeLog${idPostfix}`,
    publisher: 'TechsBCN',
    public: false,
    version: version,
    name: `DevOps-TimeLog${namePostfix}`,
    description: 'Azure DevOps extension for time logging',
    categories: ['Azure Boards'],
    targets: [
      {
        id: 'Microsoft.VisualStudio.Services',
      },
    ],
    icons: {
      default: 'logo.png',
    },
    content: {
      details: {
        path: 'overview.md',
      },
    },
    files: [
      {
        path: 'static',
        addressable: true,
      },
      {
        path: 'dist',
        addressable: true,
      },
    ],
    contributions: [
      {
        id: 'timelog-admin',
        type: 'ms.vss-web.hub',
        targets: ['ms.vss-web.project-admin-hub-group'],
        properties: {
          name: 'Timelog Admin',
          uri: 'dist/TimelogAdmin/TimelogAdmin.html',
        },
      },
      {
        id: 'timelog-entries',
        type: 'ms.vss-work-web.work-item-form-page',
        targets: ['ms.vss-work-web.work-item-form'],
        properties: {
          name: 'Timelog Entries',
          uri: 'dist/TimelogEntries/TimelogEntries.html',
        },
      },
      {
        id: 'timelog-summary',
        type: 'ms.vss-web.hub',
        targets: ['ms.vss-work-web.work-hub-group'],
        properties: {
          name: 'Timelog Summary',
          uri: 'dist/TimelogSummary/TimelogSummary.html',
          icon: {
            light: 'static/TimeLog-Black-128x128.png',
            dark: 'static/TimeLog-White-128x128.png',
          },
        },
      },
    ],
    scopes: ['vso.work', 'vso.project'],
  };

  if (env.mode == 'development') {
    manifest.baseUri = 'https://localhost:3000';
  }

  if (env.mode == 'production') {
    manifest.public = true;
  }

  return manifest;
};