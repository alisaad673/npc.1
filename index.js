import * as THREE from 'three';
// import easing from './easing.js';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useAvatarInternal, useLocalPlayer, useNpcPlayerInternal, useActivate, useLoaders, useScene, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

/* const unFrustumCull = o => {
  o.traverse(o => {
    if (o.isMesh) {
      o.frustumCulled = false;
      // o.castShadow = true;
      // o.receiveShadow = true;
    }
  });
}; */

export default e => {
  const app = useApp();
  const scene = useScene();
  const NpcPlayer = useNpcPlayerInternal();
  const localPlayer = useLocalPlayer();
  // const physics = usePhysics();
  
  /* let activateCb = null;
  let frameCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });
  useFrame(() => {
    frameCb && frameCb();
  }); */

  const subApps = [];
  // let physicsIds = [];
  let npcPlayer = null;
  e.waitUntil((async () => {
    // const u2 = `${baseUrl}tsumugi-taka.vrm`;
    // const u2 = `${baseUrl}rabbit.vrm`;
    // const u2 = `/avatars/drake_hacker_v3_vian.vrm`;
    const u2 = `/avatars/Scillia_Drophunter_V19.vrm`;
    const m = await metaversefile.import(u2);
    const vrmApp = metaversefile.createApp({
      name: u2,
    });

    // vrmApp.contentId = u2;
    // vrmApp.instanceId = getNextInstanceId();
    // console.log('set app position', app.position.toArray().join(','));
    vrmApp.position.copy(app.position);
    vrmApp.quaternion.copy(app.quaternion);
    vrmApp.scale.copy(app.scale);
    vrmApp.updateMatrixWorld();
    vrmApp.name = 'npc';
    vrmApp.setComponent('physics', true);
    await vrmApp.addModule(m);
    scene.add(vrmApp);
    subApps.push(vrmApp);

    const newNpcPlayer = new NpcPlayer();
    await newNpcPlayer.setAvatarAppAsync(vrmApp);
    npcPlayer = newNpcPlayer;
  })());

  app.getPhysicsObjects = () => {
    const result = [];
    for (const subApp of subApps) {
      result.push(...subApp.getPhysicsObjects());
    }
    return result;
  };
  // window.getPhysicsObjects = app.getPhysicsObjects;

  useFrame(({timestamp, timeDiff}) => {
    if (npcPlayer) {
      // console.log('update npc player');
      const f = timestamp / 5000;
      const s = Math.sin(f);
      npcPlayer.matrix.compose(
        localVector.set(s * 2, npcPlayer.avatar.height, 0),
        localQuaternion.setFromAxisAngle(localVector2.set(0, 1, 0), 0),
        localVector3.set(1, 1, 1),
      ).premultiply(app.matrixWorld).decompose(npcPlayer.position, npcPlayer.quaternion, localVector3);
      npcPlayer.updateMatrixWorld();
      /* npcPlayer.position.add(
        localVector.set(s * 2, npcPlayer.avatar.height, 0)
          .applyQuaternion(npcPlayer.avatar.quaternion)
      ); */
      npcPlayer.eyeballTarget.copy(localPlayer.position);
      npcPlayer.eyeballTargetEnabled = true;
      npcPlayer.updateAvatar(timestamp, timeDiff);
    }
    /* if (avatar) {
      const f = timestamp / 5000;
      const s = Math.sin(f);
      avatar.inputs.hmd.position.set(s * 2, avatar.height, 0);
      avatar.setTopEnabled(false);
      avatar.setBottomEnabled(false);
      for (let i = 0; i < 2; i++) {
        avatar.setHandEnabled(i, false);
      }
      // const timeDiffS = timeDiff / 1000;
      avatar.update(timestamp, timeDiff);
    } */
  });
  
  /* app.addEventListener('transformupdate', () => {
    for (const physicsObject of physicsIds) {
      _getPhysicsTransform(physicsObject.position, physicsObject.quaternion);
      physics.setTransform(physicsObject);
    }
  }); */

  /* useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  }); */

  return app;
};