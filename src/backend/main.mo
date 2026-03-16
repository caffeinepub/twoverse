import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Persistent State
  var _messageId = 0;
  var _memoryId = 0;

  let promptArray = [
    "What is your favorite thing about today?",
    "Describe a perfect day together.",
    "Share a childhood memory.",
    "What are you most grateful for?",
    "Describe your partner in one word.",
    "What made you smile today?",
    "Where would you like to travel together?",
    "Share a funny story.",
    "What do you appreciate most in each other?",
    "Describe your first impression.",
    "What is your favorite shared activity?",
    "Share a secret wish.",
    "Describe your ideal date night.",
    "What is your favorite memory together?",
    "Share something you admire.",
    "Describe a challenge you overcame together.",
    "What is your favorite way to relax?",
    "Share a dream for the future.",
    "Describe a perfect weekend.",
    "What makes you feel loved?",
  ];

  var inviteCode = "twvrs23";
  var startDate = "";

  // Initialize the access control state and mixin components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let storage = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module CheckIn {
    public type Emotion = {
      #happy;
      #calm;
      #stressed;
      #tired;
      #excited;
      #sad;
    };

    public type Id = Blob;

    public type T = {
      userId : Blob;
      date : Text;
      emotion : Emotion;
    };
  };

  module Message {
    public type Reaction = {
      emoji : Text;
      userId : Blob;
    };

    public type T = {
      id : Nat;
      authorId : Blob;
      authorName : Text;
      text : Text;
      timestamp : Int;
      reactions : [Reaction];
    };

    public func compare(a : T, b : T) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Memory {
    public type Id = Nat;

    public type T = {
      id : Id;
      authorId : Blob;
      authorName : Text;
      title : Text;
      description : ?Text;
      blobId : ?Text;
      timestamp : Int;
    };

    public func compare(a : T, b : T) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Persistent state variables for data storage
  let checkIns = List.empty<CheckIn.T>();
  let messages = List.empty<Message.T>();
  let memories = List.empty<Memory.T>();

  // Helper function to count registered users
  func countUsers() : Nat {
    var count = 0;
    for ((principal, profile) in userProfiles.entries()) {
      if (AccessControl.hasPermission(accessControlState, principal, #user)) {
        count += 1;
      };
    };
    count;
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Private register function
  func register(principal : Principal) {
    if (userProfiles.containsKey(principal)) {
      Runtime.trap("User is already registered");
    };
  };

  // Couple settings - Admin only
  public shared ({ caller }) func updateInviteCode(newCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update invite code");
    };
    inviteCode := newCode;
  };

  public shared ({ caller }) func updateStartDate(newDate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update start date");
    };
    startDate := newDate;
  };

  public query ({ caller }) func getStartDate() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access start date");
    };
    startDate;
  };

  // Invite code validation with max user limit - Accessible to guests for registration
  public shared ({ caller }) func registerWithInviteCode(code : Text, profile : UserProfile) : async () {
    if (code != inviteCode) {
      Runtime.trap("Invalid invite code");
    };

    // Check if max 3 users already registered
    if (countUsers() >= 3) {
      Runtime.trap("Maximum number of users (3) already registered");
    };

    // Register the user
    register(caller);

    // Save their profile
    userProfiles.add(caller, profile);

    // Assign user role - first user becomes admin, others become regular users
    let isFirstUser = countUsers() == 0;
    if (isFirstUser) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
  };

  // Daily check-ins
  public shared ({ caller }) func submitCheckIn(date : Text, emotion : CheckIn.Emotion) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit check-ins");
    };

    // Remove existing check-in for user/date
    let filtered = checkIns.filter(
      func(ci) {
        ci.userId != caller.toBlob() or ci.date != date;
      }
    );
    checkIns.clear();
    checkIns.addAll(filtered.values());

    let newCheckIn : CheckIn.T = {
      userId = caller.toBlob();
      date;
      emotion;
    };
    checkIns.add(newCheckIn);
  };

  public query ({ caller }) func getTodayCheckIns(date : Text) : async [CheckIn.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view check-ins");
    };
    checkIns.filter(
      func(ci) {
        ci.date == date;
      }
    ).toArray();
  };

  public query ({ caller }) func getUserCheckIn(date : Text) : async ?CheckIn.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view check-ins");
    };
    switch (checkIns.values().find(
      func(ci) {
        ci.userId == caller.toBlob() and ci.date == date;
      }
    )) {
      case (?checkIn) { ?checkIn };
      case (null) { null };
    };
  };

  // Daily prompts
  public query ({ caller }) func getDailyPrompt(dayOfYear : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily prompts");
    };
    let index = dayOfYear % promptArray.size();
    promptArray[index];
  };

  // Chat functionality
  public shared ({ caller }) func sendMessage(authorName : Text, text : Text) : async Message.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message : Message.T = {
      id = _messageId;
      authorId = caller.toBlob();
      authorName;
      text;
      timestamp = Time.now();
      reactions = [];
    };

    messages.add(message);
    _messageId += 1;
    message;
  };

  public shared ({ caller }) func addReaction(messageId : Nat, emoji : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reactions");
    };

    let messageIndex = messages.values().toArray().findIndex(
      func(msg) {
        msg.id == messageId;
      }
    );

    switch (messageIndex) {
      case (null) { Runtime.trap("Message not found") };
      case (?index) {
        let reaction : Message.Reaction = {
          emoji;
          userId = caller.toBlob();
        };

        let messageList = messages.toArray();
        let msg = messageList[index];

        // Prevent duplicate reactions
        let hasReaction = msg.reactions.find(
          func(r) {
            r.emoji == emoji and r.userId == caller.toBlob();
          }
        );
        if (not hasReaction.isNull()) { Runtime.trap("Reaction already exists") };

        let updatedReactions = msg.reactions.concat([reaction]);
        let updatedMessage : Message.T = {
          id = msg.id;
          authorId = msg.authorId;
          authorName = msg.authorName;
          text = msg.text;
          timestamp = msg.timestamp;
          reactions = updatedReactions;
        };

        messages.clear();
        messages.addAll(messageList.values());
      };
    };
  };

  public shared ({ caller }) func removeReaction(messageId : Nat, emoji : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove reactions");
    };

    let messageIndex = messages.values().toArray().findIndex(
      func(msg) {
        msg.id == messageId;
      }
    );

    switch (messageIndex) {
      case (null) { Runtime.trap("Message not found") };
      case (?index) {
        let messageList = messages.toArray();
        let msg = messageList[index];

        let filteredReactions = msg.reactions.filter(
          func(reaction) {
            not (reaction.emoji == emoji and reaction.userId == caller.toBlob());
          }
        );

        let updatedMessage : Message.T = {
          id = msg.id;
          authorId = msg.authorId;
          authorName = msg.authorName;
          text = msg.text;
          timestamp = msg.timestamp;
          reactions = filteredReactions;
        };

        messages.clear();
        messages.addAll(messageList.values());
      };
    };
  };

  public query ({ caller }) func getMessages() : async [Message.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.toArray().sort();
  };

  // Memory vault
  public shared ({ caller }) func createMemory(authorName : Text, title : Text, description : ?Text, blobId : ?Text) : async Memory.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create memories");
    };

    let memory : Memory.T = {
      id = _memoryId;
      authorId = caller.toBlob();
      authorName;
      title;
      description;
      blobId;
      timestamp = Time.now();
    };

    memories.add(memory);
    _memoryId += 1;
    memory;
  };

  public shared ({ caller }) func deleteMemory(memoryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete memories");
    };

    // Find the memory to verify ownership
    let memoryToDelete = memories.values().find(
      func(mem) {
        mem.id == memoryId;
      }
    );

    switch (memoryToDelete) {
      case (null) { Runtime.trap("Memory not found") };
      case (?mem) {
        // Only the author can delete their own memory
        if (mem.authorId != caller.toBlob()) {
          Runtime.trap("Unauthorized: Only the author can delete this memory");
        };

        let filtered = memories.filter(
          func(m) {
            m.id != memoryId;
          }
        );
        memories.clear();
        memories.addAll(filtered.values());
      };
    };
  };

  public query ({ caller }) func getMemories() : async [Memory.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view memories");
    };
    memories.toArray().sort();
  };

  public query ({ caller }) func getBlobLink(blobId : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access blob links");
    };
    storage.get(blobId);
  };
};

